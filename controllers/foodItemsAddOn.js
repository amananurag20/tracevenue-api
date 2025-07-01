const mongoose = require("mongoose");
const FoodItemsAddOn = require("../models/FoodItemsAddOn");
const FoodItems = require("../models/FoodItems");
const { logger, errorLogger } = require("../config/logger");

exports.createFoodItemsAddOn = async (req, res) => {
  try {
    const { foodItemId, AddOnData } = req.body;
    const addOnDataArray = Array.isArray(AddOnData) ? AddOnData : [AddOnData];
    let addOnIds = [];

    // Create and save each FoodItemsAddOn
    for (const addOnData of addOnDataArray) {
      const foodItemsAddOn = new FoodItemsAddOn({
        ...addOnData,
        foodItemId,
      });
      await foodItemsAddOn.save();
      addOnIds.push(foodItemsAddOn._id);
    }

    // Find and update the food item
    const foodItem = await FoodItems.findById(foodItemId);
    if (!foodItem) {
      return res
        .status(404)
        .json({ success: false, error: "FoodItem not found" });
    }

    // Push the new add-on IDs to the food item
    await FoodItems.findByIdAndUpdate(
      foodItemId,
      { $push: { foodItemsAddOn_id: { $each: addOnIds } } },
      { new: true }
    );

    logger.info("FoodItemsAddOn created successfully", { addOnIds });
    res.status(201).json({ success: true, data: addOnIds });
  } catch (error) {
    errorLogger.error("Error creating FoodItemsAddOn", {
      error: error.message,
    });
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllFoodItemsAddOn = async (req, res) => {
  try {
    const foodItemsAddOns = await FoodItemsAddOn.find();
    logger.info("Retrieved all FoodItemsAddOns successfully");
    res.status(200).json({ success: true, data: foodItemsAddOns });
  } catch (error) {
    errorLogger.error("Error getting all FoodItemsAddOns", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFoodItemsAddOnById = async (req, res) => {
  try {
    const foodItemsAddOn = await FoodItemsAddOn.findById(req.params.id);
    if (!foodItemsAddOn) {
      return res
        .status(404)
        .json({ success: false, error: "FoodItemsAddOn not found" });
    }
    logger.info("Retrieved FoodItemsAddOn by ID successfully", {
      foodItemsAddOn,
    });
    res.status(200).json({ success: true, data: foodItemsAddOn });
  } catch (error) {
    errorLogger.error("Error getting FoodItemsAddOn by ID", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFoodItemsAddOn = async (req, res) => {
  try {
    const foodItemsAddOn = await FoodItemsAddOn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!foodItemsAddOn) {
      return res

        .status(404)
        .json({ success: false, error: "FoodItemsAddOn not found" });
    }
    logger.info("FoodItemsAddOn updated successfully", { foodItemsAddOn });
    res.status(200).json({ success: true, data: foodItemsAddOn });
  } catch (error) {
    errorLogger.error("Error updating FoodItemsAddOn", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFoodItemsAddOn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const foodItemsAddOn = await FoodItemsAddOn.findByIdAndDelete(
      req.params.id,
      { session }
    );

    if (!foodItemsAddOn) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "FoodItemsAddOn not found" });
    }

    await FoodItems.findByIdAndUpdate(
      foodItemsAddOn.foodItemId,
      { $pull: { foodItemsAddOn_id: foodItemsAddOn._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("FoodItemsAddOn deleted successfully", { foodItemsAddOn });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    errorLogger.error("Error deleting FoodItemsAddOn", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};
