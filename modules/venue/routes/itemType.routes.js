const express = require('express');
const router = express.Router();
const itemTypeController = require('../controllers/itemType.controller');

// Get all item types
router.get('/', itemTypeController.findAll);

// Create new item type
router.post('/', itemTypeController.create);

// Toggle item type active status
router.patch('/:id/toggle', itemTypeController.toggleActive);

module.exports = router; 