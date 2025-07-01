const express = require('express');
const router = express.Router();
const mediaController = require('./media.controller');
const path = require('path');

// Initialize media controller
mediaController.init();

// Upload a file
router.post('/upload', 
  mediaController.getUploadMiddleware(),
  (req, res) => mediaController.uploadFile(req, res)
);

// List all files
router.get('/', (req, res) => mediaController.listFiles(req, res));

// Delete a file
router.delete('/:filename', (req, res) => mediaController.deleteFile(req, res));

module.exports = router; 