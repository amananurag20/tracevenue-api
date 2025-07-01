const schedulerService = require('../services/scheduler.service');
const Task = require('../models/task.model');
const logger = require('../utils/logger');

class SchedulerController {
  // Create a new task
  async createTask(req, res) {
    try {
      const task = await schedulerService.addTask(req.body);
      logger.info(`Created new task: ${task.taskName}`);
      res.status(201).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Get all tasks
  async getAllTasks(req, res) {
    try {
      const tasks = await Task.find();
      logger.info('Retrieved all tasks');
      res.status(200).json({
        status: 'success',
        data: tasks
      });
    } catch (error) {
      logger.error(`Error retrieving tasks: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Get a single task
  async getTask(req, res) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        logger.warn(`Task not found with id: ${req.params.id}`);
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }
      logger.info(`Retrieved task: ${task.taskName}`);
      res.status(200).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      logger.error(`Error retrieving task: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Update a task
  async updateTask(req, res) {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!task) {
        logger.warn(`Task not found with id: ${req.params.id}`);
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }
      logger.info(`Updated task: ${task.taskName}`);
      res.status(200).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      logger.error(`Error updating task: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Delete a task
  async deleteTask(req, res) {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        logger.warn(`Task not found with id: ${req.params.id}`);
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }
      logger.info(`Deleted task: ${task.taskName}`);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Deactivate a task
  async deactivateTask(req, res) {
    try {
      const task = await schedulerService.deactivateTask(req.params.id);
      if (!task) {
        logger.warn(`Task not found with id: ${req.params.id}`);
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }
      logger.info(`Deactivated task: ${task.taskName}`);
      res.status(200).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      logger.error(`Error deactivating task: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new SchedulerController(); 