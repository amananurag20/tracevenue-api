const Task = require('../models/task.model');
const logger = require('../utils/logger');
const Job = require('../../venue/models/jobs.model');
const Restaurant = require('../../../models/RestaurantModels');
const { addVariantsToJob } = require('../../venue/controllers/jobs.controller');
const mongoose = require('mongoose');
const AutoApplyLog = require('../models/autoApplyLog.model');

class SchedulerService {
  constructor() {
    this.isRunning = false;
  }

  // Handle auto-apply task
  async executeAutoApplyTask(task) {
    logger.info(`Executing auto-apply task for restaurant: ${task.restaurantId}`);
    try {
      // Calculate time window based on delay setting
      const currentTime = new Date();
      const delayMinutes = task.taskData.delay || 0;
      const endTime = new Date(currentTime.getTime() - (delayMinutes * 60 * 1000));
      const startTime = new Date(endTime.getTime() - (30 * 60 * 1000)); // 30 minutes before end time

      logger.info(`Searching for jobs updated between ${startTime.toISOString()} and ${endTime.toISOString()}`);

      // Convert restaurantId to ObjectId for proper comparison
      const restaurantObjectId = new mongoose.Types.ObjectId(task.restaurantId);

      // Find active jobs updated within the time window
      // with matching criteria and not already including the restaurant
      const activeJobs = await Job.find({
        status: 'Active',
        updatedAt: {
          $gte: startTime,
          $lte: endTime
        },
        // Ensure restaurant is not already added
        restaurant_id: { 
          $nin: [restaurantObjectId] 
        },
        // Check for matches with required percentage
        'matched.0.0.matches': {
          $elemMatch: {
            venue_id: task.restaurantId.toString(),
            match_percentage: { $gte: task.taskData.minMatchPercentage || 0 }
          }
        }
      });

      logger.info(`Found ${activeJobs.length} matching jobs within time window`);

      let successCount = 0;
      let failureCount = 0;

      for (const job of activeJobs) {
        try {
          // Get matching variants directly from the job's matches
          const matches = job.matched?.[0]?.[0]?.matches || [];
          
          const matchingVariants = matches
            .filter(match => 
              match.venue_id === task.restaurantId.toString() && 
              (match.match_percentage || 0) >= (task.taskData.minMatchPercentage || 0)
            )
            .map(match => match.variant_id)
            .filter(Boolean);

          if (matchingVariants.length > 0) {
            logger.info(`Found ${matchingVariants.length} matching variants for job ${job._id}`);
            
            try {
              const req = {
                params: { jobId: job._id.toString() },
                body: {
                  variantIds: matchingVariants,
                  resId: task.restaurantId.toString()
                },
                autoApply: true
              };

              let responseData = null;
              let statusCode = null;

              const res = {
                status: (code) => ({
                  json: (data) => {
                    statusCode = code;
                    responseData = data;
                    logger.info(`Auto-apply response for restaurant ${task.restaurantId} on job ${job._id}:`, code, data);
                    return data;
                  }
                })
              };

              // Call addVariantsToJob directly
              await addVariantsToJob(req, res);
              
              // Create log entry
              const maxMatchPercentage = Math.max(...matches
                .filter(match => match.venue_id === task.restaurantId.toString())
                .map(match => match.match_percentage || 0));

              await AutoApplyLog.create({
                restaurantId: task.restaurantId,
                jobId: job._id,
                status: statusCode === 200 && responseData?.success ? 'success' : 'failure',
                matchPercentage: maxMatchPercentage,
                variantsApplied: matchingVariants,
                taskData: {
                  delay: task.taskData.delay,
                  minMatchPercentage: task.taskData.minMatchPercentage
                },
                errorMessage: statusCode !== 200 || !responseData?.success ? 
                  responseData?.message || 'Unknown error' : undefined
              });

              // Check if the operation was successful
              if (statusCode === 200 && responseData?.success) {
                successCount++;
                logger.info(`Successfully auto-applied restaurant ${task.restaurantId} to job ${job._id}`);
              } else {
                failureCount++;
                logger.error(`Failed to auto-apply restaurant ${task.restaurantId} to job ${job._id}. Status: ${statusCode}, Response:`, responseData);
              }
              
            } catch (variantError) {
              failureCount++;
              logger.error(`Error adding variants to job ${job._id}: ${variantError.message}`);
              
              // Log the error
              await AutoApplyLog.create({
                restaurantId: task.restaurantId,
                jobId: job._id,
                status: 'failure',
                matchPercentage: Math.max(...matches
                  .filter(match => match.venue_id === task.restaurantId.toString())
                  .map(match => match.match_percentage || 0)),
                variantsApplied: matchingVariants,
                taskData: {
                  delay: task.taskData.delay,
                  minMatchPercentage: task.taskData.minMatchPercentage
                },
                errorMessage: variantError.message
              });
            }
          } else {
            logger.info(`No matching variants found for restaurant ${task.restaurantId} and job ${job._id}`);
          }
        } catch (jobError) {
          failureCount++;
          logger.error(`Error processing job ${job._id}: ${jobError.message}`);
          continue;
        }
      }

      logger.info(`Completed auto-apply execution for restaurant: ${task.restaurantId}. Success: ${successCount}, Failures: ${failureCount}`);
      
      return {
        success: true,
        jobsProcessed: activeJobs.length,
        successCount,
        failureCount,
        restaurantId: task.restaurantId
      };

    } catch (error) {
      logger.error(`Error in auto-apply execution for restaurant ${task.restaurantId}: ${error.message}`);
      throw error;
    }
  }

  // IMPROVED: Better task processing with error handling and summary
  async processTasks() {
    if (this.isRunning) {
      logger.info('Scheduler is already running');
      return;
    }

    const startTime = new Date();
    let tasksSummary = {
      total: 0,
      successful: 0,
      failed: 0,
      autoApplyResults: []
    };

    try {
      this.isRunning = true;
      logger.info('Starting task processing');

      // Find all active tasks
      const activeTasks = await Task.find({ active: true });
      tasksSummary.total = activeTasks.length;
      
      logger.info(`Found ${activeTasks.length} active tasks to process`);

      for (const task of activeTasks) {
        try {
          let result = null;
          
          if (task.taskType === 'autoApply') {
            result = await this.executeAutoApplyTask(task);
            tasksSummary.autoApplyResults.push(result);
          } else {
            // Execute the dummy function for other tasks
            await this.executeDummyTask(task);
          }

          // Update last execution time
          task.lastExecutedAt = new Date();
          await task.save();
          
          tasksSummary.successful++;
          logger.info(`Successfully executed task ${task._id} (${task.taskType})`);
          
        } catch (error) {
          tasksSummary.failed++;
          logger.error(`Error executing task ${task._id} (${task.taskType}): ${error.message}`);
        }
      }

    } catch (error) {
      logger.error(`Error in task processing: ${error.message}`);
    } finally {
      this.isRunning = false;
      const endTime = new Date();
      const duration = endTime - startTime;
      
      logger.info(`Completed task processing in ${duration}ms. Summary:`, tasksSummary);
    }

    return tasksSummary;
  }

  // IMPROVED: Better validation for auto-apply task management
  async manageAutoApplyTask(restaurantId, autoApplySettings) {
    try {
      // Validate input
      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }

      if (!autoApplySettings || typeof autoApplySettings !== 'object') {
        throw new Error('Auto-apply settings are required');
      }

      // Find existing auto-apply task for this restaurant
      let task = await Task.findOne({ 
        restaurantId, 
        taskType: 'autoApply' 
      });

      if (autoApplySettings.enabled) {
        // Validate required settings
        const delay = autoApplySettings.delay || 0;
        const minMatchPercentage = autoApplySettings.minMatchPercentage || 0;
        
        if (delay < 0) {
          throw new Error('Delay cannot be negative');
        }
        
        if (minMatchPercentage < 0 || minMatchPercentage > 100) {
          throw new Error('Match percentage must be between 0 and 100');
        }

        // Create or update task
        if (!task) {
          task = new Task({
            taskName: 'AutoApply',
            restaurantId,
            taskType: 'autoApply',
            active: true,
            taskData: {
              delay,
              minMatchPercentage,
              visibility: autoApplySettings.visibility || 'public'
            }
          });
          logger.info(`Creating new auto-apply task for restaurant ${restaurantId}`);
        } else {
          task.active = true;
          task.taskData = {
            delay,
            minMatchPercentage,
            visibility: autoApplySettings.visibility || 'public'
          };
          logger.info(`Updating existing auto-apply task ${task._id} for restaurant ${restaurantId}`);
        }
        
        await task.save();
        logger.info(`Auto-apply task ${task._id} created/updated for restaurant ${restaurantId}`);
        
      } else if (task) {
        // Deactivate existing task if auto-apply is disabled
        task.active = false;
        await task.save();
        logger.info(`Auto-apply task ${task._id} deactivated for restaurant ${restaurantId}`);
      }

      return task;
    } catch (error) {
      logger.error(`Error managing auto-apply task for restaurant ${restaurantId}: ${error.message}`);
      throw error;
    }
  }

  // Dummy function to simulate task execution
  async executeDummyTask(task) {
    logger.info(`Executing dummy task: ${task.taskName} for restaurant: ${task.restaurantId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.info(`Completed dummy task: ${task.taskName}`);
  }

  // Method to add a new task
  async addTask(taskData) {
    try {
      // Basic validation
      if (!taskData.restaurantId || !taskData.taskType) {
        throw new Error('Restaurant ID and task type are required');
      }

      const task = new Task(taskData);
      await task.save();
      logger.info(`Added new task ${task._id} for restaurant ${taskData.restaurantId}`);
      return task;
    } catch (error) {
      logger.error(`Error adding task: ${error.message}`);
      throw error;
    }
  }

  // Method to deactivate a task
  async deactivateTask(taskId) {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        { active: false, deactivatedAt: new Date() },
        { new: true }
      );
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      logger.info(`Deactivated task ${taskId}`);
      return task;
    } catch (error) {
      logger.error(`Error deactivating task ${taskId}: ${error.message}`);
      throw error;
    }
  }

  // ADDED: Method to get task status for monitoring
  async getTaskStatus(restaurantId, taskType = null) {
    try {
      const query = { restaurantId };
      if (taskType) {
        query.taskType = taskType;
      }

      const tasks = await Task.find(query);
      return tasks;
    } catch (error) {
      logger.error(`Error getting task status: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SchedulerService();