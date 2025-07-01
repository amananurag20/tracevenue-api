const FoodCategory = require("../models/FoodCategory");
const FoodItems = require("../models/FoodItems");
const { logger, errorLogger } = require("../config/logger");
const mongoose = require("mongoose");
const { menuCategoriesDetailsUpdate } = require("../events/communication");
const FoodSubCategory = require("../models/FoodSubCategory");

exports.createFoodCategory = async (req, res) => {
  try {
    const data = req.body;
    const savedFoodCategories = [];

    for (const item of data) {
      // Check if a food category with the same restaurant_id and name exists
      const existingCategory = await FoodCategory.findOne({
        restaurant_id: item.restaurant_id,
        name: { $regex: new RegExp(item.name, "i") },
      });

      if (existingCategory) {
        // If a category with the same restaurant_id and name exists, skip saving
        return res.status(400).send({
          error: `Category '${item.name}' already exists for this restaurant`,
        });
      }

      // If no existing category found, save the new category
      const foodCategory = new FoodCategory(item);
      const savedFoodCategory = await foodCategory.save();
      savedFoodCategories.push(savedFoodCategory);

      // Update menu categories details
      menuCategoriesDetailsUpdate(item?.restaurant_id);
    }

    logger.info("FoodCategories created successfully", {
      foodCategories: savedFoodCategories,
    });
    // Send response after all categories are processed
    return res.status(201).send(savedFoodCategories);
  } catch (error) {
    errorLogger.error("Error creating foodCategories", {
      error: error.message,
    });
    console.log(error);

    return res.status(400).send({ error: error.message });
  }
};

exports.getFoodCategory = async (req, res) => {
  try {
    const foodCategoryData = await FoodCategory.find();
    logger.info("Retrieved all foodCategories successfully");
    res.status(200).send(foodCategoryData);
  } catch (error) {
    errorLogger.error("Error getting all foodCategories", {
      error: error.message,
    });
    res.status(400).send(error);
  }
};

exports.getFoodCategoryById = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findById(req.params.id);
    if (!foodCategory) {
      return res
        .status(404)
        .json({ success: false, error: "FoodCategory not found" });
    }
    logger.info("Retrieved foodCategory by ID successfully", { foodCategory });
    res.status(200).json({ success: true, data: foodCategory });
  } catch (error) {
    errorLogger.error("Error getting foodCategory by ID", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFoodCategoriesByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { isAdmin } = req.query;

    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    // Fetch categories for the restaurant
    let foodCategories = await FoodCategory.find({
      restaurant_id: restaurantObjectId,
    });

    // if (foodCategories.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ success: false, error: "No food categories found" });
    // }
    if (foodCategories.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    if (isAdmin === "true") {
      return res.status(200).json({ success: true, data: foodCategories });
    }

    // Use aggregation pipeline to find categories that have associated food items
    const foodCategoriesWithItems = await FoodCategory.aggregate([
      {
        $match: {
          restaurant_id: restaurantObjectId,
        },
      },
      // {
      //   $lookup: {
      //     from: "fooditems",
      //     let: { categoryId: "$_id" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$restaurant_id", restaurantObjectId] },
      //               {
      //                 $or: [
      //                   {
      //                     $eq: ["$category.id", { $toString: "$$categoryId" }],
      //                   },
      //                   { $eq: ["$category.id", { $toString: "$$catID" }] },
      //                 ],
      //               },
      //             ],
      //           },
      //         },
      //       },
      //       { $limit: 1 },
      //     ],
      //     as: "foodItems",
      //   },
      // },
      // {
      //   $match: {
      //     foodItems: { $ne: [] },
      //   },
      // },
      // {
      //   $project: {
      //     foodItems: 0,
      //   },
      // },
    ]);

    if (foodCategoriesWithItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No food categories with food items found",
      });
    }

    logger.info("Retrieved food categories successfully", {
      foodCategories: foodCategoriesWithItems,
    });
    res.status(200).json({ success: true, data: foodCategoriesWithItems });
  } catch (error) {
    errorLogger.error("Error getting food categories by restaurant ID", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFoodCategory = async (req, res) => {
  try {
    const foodCategory = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!foodCategory) {
      return res
        .status(404)
        .json({ success: false, error: "FoodCategory not found" });
    }
    logger.info("FoodCategory updated successfully", { foodCategory });
    //for menu related changes in user side
    menuCategoriesDetailsUpdate(foodCategory?.restaurant_id);
    res.status(200).json({ success: true, data: foodCategory });
  } catch (error) {
    errorLogger.error("Error updating foodCategory", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFoodCategory = async (req, res) => {
  try {
    const deletedFoodCategory = await FoodCategory.findByIdAndDelete(
      req.params.id
    );
    if (!deletedFoodCategory) {
      return res
        .status(404)
        .json({ success: false, error: "FoodCategory not found" });
    }

    const subCategoryIds = deletedFoodCategory.subCategory.map(
      (sub) => sub._id
    );

    const deletedFoodItems = await FoodItems.deleteMany({
      "category._id": { $in: subCategoryIds.map((id) => id.toString()) },
    });
    console.log("deleted food items", deletedFoodItems);

    await FoodSubCategory.deleteMany({
      _id: { $in: subCategoryIds },
    });

    logger.info("FoodCategory and related subcategories deleted successfully", {
      foodCategory: deletedFoodCategory,
    });

    res.status(200).json({ success: true, data: {} });

    // Trigger menu updates on user side
    menuCategoriesDetailsUpdate(deletedFoodCategory?.restaurant_id);
  } catch (error) {
    errorLogger.error("Error deleting foodCategory", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFoodCategoryFields = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) {
      updates.name = req.body.name;
    }
    const foodCategory = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!foodCategory) {
      return res
        .status(404)
        .json({ success: false, error: "FoodCategory not found" });
    }
    menuCategoriesDetailsUpdate(foodCategory?.restaurant_id);
    logger.info("FoodCategory fields updated successfully", { foodCategory });
    res.status(200).json({ success: true, data: foodCategory });
  } catch (error) {
    errorLogger.error("Error updating foodCategory fields", {
      error: error.message,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};
