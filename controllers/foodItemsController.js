const FoodItems = require("../models/FoodItems");
const FoodItemsAddOn = require("../models/FoodItemsAddOn");
const { logger, errorLogger } = require("../config/logger");
const mongoose = require("mongoose");
const { menuDetailsUpdate } = require("../events/communication");

exports.createFoodItems = async (req, res) => {
  try {
    const { AddOnData, name, restaurant_id, taxable, tax, ...foodItemData } = req.body;

    const existingFoodItem = await FoodItems.findOne({
      name,
      restaurant_id,
    });
    if (existingFoodItem) {
      return res.status(400).json({
        success: false,
        error: "Food item already exists for this restaurant.",
      });
    }

    let taxableAmount = 0;
    if (taxable) {
      taxableAmount = foodItemData?.basePrice + ((tax?.cgst + tax?.sgst) / 100) * foodItemData?.basePrice
    }
    const foodItem = new FoodItems({ name, restaurant_id, taxable, taxableAmount, tax, ...foodItemData });
    await foodItem.save();

    if (AddOnData) {
      const addOnDataArray = Array.isArray(AddOnData) ? AddOnData : [AddOnData];
      let addOnIds = foodItem.foodItemsAddOn_id || [];

      for (const addOnData of addOnDataArray) {
        const foodItemAddOn = new FoodItemsAddOn({
          ...addOnData,
          foodItemId: foodItem._id,
        });

        await foodItemAddOn.save();
        addOnIds.push(foodItemAddOn._id);
      }

      foodItem.foodItemsAddOn_id = addOnIds;
      await foodItem.save();
    }

    menuDetailsUpdate(restaurant_id);
    logger.info("FoodItem created successfully", { foodItem });
    res.status(201).json({ success: true, data: foodItem });
  } catch (err) {
    errorLogger.error("Error creating foodItem", { error: err.message });
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllFoodItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const searchTerm = req.query.search;
    const restaurant_id = req.query.restaurant_id;

    let filters = {};
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");
      filters.$or = [
        { name: { $regex: searchRegex } },
        { itemName: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    if (restaurant_id) {
      filters.restaurant_id = restaurant_id;
    }

    const totalCount = await FoodItems.countDocuments(filters);

    let query = FoodItems.find(filters).populate("foodItemsAddOn_id");

    if (limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const foodItems = await query;

    res.status(200).json({ success: true, data: foodItems, totalCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFoodItemsById = async (req, res) => {
  try {
    const foodItems = await FoodItems.findById(req.params.id).populate(
      "foodItemsAddOn_id"
    );
    if (!foodItems) {
      return res
        .status(404)
        .json({ success: false, error: "FoodItems not found" });
    }
    logger.info("Retrieved foodItems by ID successfully", { foodItems });
    res.status(200).json({ success: true, data: foodItems });
  } catch (err) {
    errorLogger.error("Error getting foodItems by ID", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.updateFoodItems = async (req, res) => {
  try {
    const { name, restaurant_id, taxable, tax, ...updateData } = req.body;

    if (name) {
      const existingFoodItem = await FoodItems.findOne({
        name,
        restaurant_id,
      });
      if (existingFoodItem && !existingFoodItem._id.equals(req.params.id)) {
        return res.status(400).json({
          success: false,
          error: "The name already exists for another food item.",
        });
      }
    }

    let taxableAmount = 0
    if (taxable) {
      taxableAmount = updateData?.basePrice + ((+tax?.cgst + +tax?.sgst) / 100) * updateData?.basePrice;
    }

    const foodItems = await FoodItems.findByIdAndUpdate(
      req.params.id,
      { ...updateData, taxable, tax, taxableAmount: taxableAmount ?? 0, name, restaurant_id },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!foodItems) {
      return res
        .status(404)
        .json({ success: false, error: "Food item not found." });
    }

    logger.info("Food item updated successfully", { foodItems });

    //for menu related changes in user side
    menuDetailsUpdate(restaurant_id);
    res.status(200).json({ success: true, data: foodItems });
  } catch (err) {
    console.log('sdfjsdflkj: ', err)
    errorLogger.error("Error updating food item", { error: err });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteFoodItems = async (req, res) => {
  try {
    const deletedFoodItems = await FoodItems.findByIdAndDelete(req.params.id);
    if (!deletedFoodItems) {
      return res
        .status(404)
        .json({ success: false, error: "FoodItems not found" });
    }
    await FoodItemsAddOn.deleteMany({ foodItem_id: deletedFoodItems._id });
    logger.info("FoodItems deleted successfully", { deletedFoodItems });
    //for menu related changes in user side
    menuDetailsUpdate(deletedFoodItems?.restaurant_id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    errorLogger.error("Error deleting foodItems", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFoodItemsByRestaurantId = async (req, res) => {
  try {
    const restaurant_id = req.query.restaurant_id;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        error: "restaurant_id query parameter is required",
      });
    }

    const foodItems = await FoodItems.find({ restaurant_id }).populate(
      "foodItemsAddOn_id"
    );

    if (!foodItems || foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No food items found for this restaurant.",
      });
    }

    logger.info("Retrieved food items by restaurant ID successfully", {
      restaurant_id,
      foodItems,
    });
    res.status(200).json({ success: true, data: foodItems });
  } catch (err) {
    console.log(err);

    errorLogger.error("Error getting food items by restaurant ID", {
      error: err.message,
    });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.applyTaxOnFoodItems = async (req, res) => {
  try {
    const { data } = req.body;
    const resId = req.params._id;
    // Ensure data is either true or false
    if (data !== true && data !== false) {
      return res.status(400).json({
        success: false,
        error: "Invalid 'data' value. It must be either true or false.",
      });
    }

    // Fetch the food items for the given restaurant
    const foodItems = await FoodItems.find({ resId }).populate(
      "foodItemsAddOn_id"
    );


    if (!foodItems || foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No food items found for this restaurant.",
      });
    }

    // Update the taxable field for each food item
    const updatedFoodItems = await Promise.all(
      foodItems.map(async (foodItem) => {
        foodItem.taxable = data; // Update the taxable field with the provided 'data' value
        await foodItem.save(); // Save the updated food item
        return foodItem; // Return the updated food item
      })
    );

    // Respond with the updated food items
    res.status(200).json({
      success: true,
      message: `Taxable field updated successfully for ${updatedFoodItems.length} food items.`,
      data: updatedFoodItems,
    });
  } catch (err) {
    // Log the error and send a server error response
    errorLogger.error("Error while applying tax on food items", {
      error: err.message,
    });
    res.status(500).json({ success: false, error: err.message });
  }
};
