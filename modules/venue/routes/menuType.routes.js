const express = require('express');
const router = express.Router();
const menuTypeController = require('../controllers/menuType.controller');
const { authMiddleware } = require("../../../middleware/authMiddleware");

// Create a new menu type
router.post('/', authMiddleware, menuTypeController.create);

// Get all menu types
router.get('/', authMiddleware, menuTypeController.findAll);

// Get a single menu type by ID
router.get('/:id', authMiddleware, menuTypeController.findOne);

// Update a menu type
router.put('/:id', authMiddleware, menuTypeController.update);

// Delete a menu type
router.delete('/:id', authMiddleware, menuTypeController.delete);

module.exports = router; 