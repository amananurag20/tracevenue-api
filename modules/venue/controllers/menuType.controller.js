const MenuType = require('../models/menuType.model');

// Create a new menu type
exports.create = async (req, res) => {
  try {
    const menuType = new MenuType(req.body);
    const savedMenuType = await menuType.save();
    res.status(201).json({
      success: true,
      message: 'Menu type created successfully',
      data: savedMenuType
    });
  } catch (error) {
    console.error('Error creating menu type:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Menu type already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create menu type',
      error: error.message
    });
  }
};

// Get all menu types
exports.findAll = async (req, res) => {
  try {
    const menuTypes = await MenuType.find();
    res.status(200).json({
      success: true,
      message: 'Menu types retrieved successfully',
      data: menuTypes
    });
  } catch (error) {
    console.error('Error fetching menu types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu types',
      error: error.message
    });
  }
};

// Get a single menu type by ID
exports.findOne = async (req, res) => {
  try {
    const menuType = await MenuType.findById(req.params.id);
    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: 'Menu type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu type retrieved successfully',
      data: menuType
    });
  } catch (error) {
    console.error('Error fetching menu type:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu type ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu type',
      error: error.message
    });
  }
};

// Update a menu type
exports.update = async (req, res) => {
  try {
    const menuType = await MenuType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: 'Menu type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu type updated successfully',
      data: menuType
    });
  } catch (error) {
    console.error('Error updating menu type:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Menu type already exists'
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu type ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update menu type',
      error: error.message
    });
  }
};

// Delete a menu type
exports.delete = async (req, res) => {
  try {
    const menuType = await MenuType.findByIdAndDelete(req.params.id);

    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: 'Menu type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu type:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu type ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu type',
      error: error.message
    });
  }
}; 