const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/scheduler.controller');

// Create a new task
router.post('/tasks', schedulerController.createTask);

// Get all tasks
router.get('/tasks', schedulerController.getAllTasks);

// Get a single task
router.get('/tasks/:id', schedulerController.getTask);

// Update a task
router.put('/tasks/:id', schedulerController.updateTask);

// Delete a task
router.delete('/tasks/:id', schedulerController.deleteTask);

// Deactivate a task
router.patch('/tasks/:id/deactivate', schedulerController.deactivateTask);

module.exports = router; 