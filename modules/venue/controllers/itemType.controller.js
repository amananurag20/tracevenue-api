const ItemType = require('../models/itemType.model');

exports.create = async (req, res) => {
  try {
    const itemType = new ItemType(req.body);
    const savedItemType = await itemType.save();
    
    res.status(201).json({
      success: true,
      message: 'Item type created successfully',
      data: savedItemType
    });
  } catch (error) {
    console.error('Error creating item type:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Item type already exists in this category'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create item type',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const itemTypes = await ItemType.find(query);
    
    res.status(200).json({
      success: true,
      data: itemTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item types',
      error: error.message
    });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const itemType = await ItemType.findById(req.params.id);
    if (!itemType) {
      return res.status(404).json({
        success: false,
        message: 'Item type not found'
      });
    }

    itemType.isActive = !itemType.isActive;
    await itemType.save();

    res.status(200).json({
      success: true,
      message: `Item type ${itemType.isActive ? 'activated' : 'deactivated'} successfully`,
      data: itemType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle item type status',
      error: error.message
    });
  }
}; 