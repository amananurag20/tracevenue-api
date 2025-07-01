const cron = require('node-cron');
const schedulerService = require('./services/scheduler.service');
const logger = require('./utils/logger');

// Initialize the scheduler to run every 5 minutes
const initializeScheduler = () => {
  logger.info('Initializing job scheduler');
  
  // Schedule tasks to run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled task check');
    await schedulerService.processTasks();
  });

  logger.info('Job scheduler initialized successfully');
};

module.exports = {
  initializeScheduler
}; 