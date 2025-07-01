const FoodSubCategory = require("../models/FoodSubCategory");
const FoodCategory = require("../models/FoodCategory");
const FoodItems = require("../models/FoodItems");

exports.createSubCategory = async (req, res) => {
  const { name, category_id, restaurant_id } = req.body;
  try {
    const category = await FoodCategory.findOne({
      restaurant_id: restaurant_id,
      $or: [{ catID: category_id }, { _id: category_id }],
    });

    if (!category) {
      return res.status(400).json({
        message: "Category not found or restaurant ID does not match",
      });
    }

    // Check if a subcategory with the same name already exists
    const existingSubCategory = await FoodSubCategory.findOne({
      name: name,
      category_id: category._id,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        error: "Subcategory with this name already exists",
      });
    }

    const newSubCategory = new FoodSubCategory({
      name,
      category_id: category._id,
    });
    await newSubCategory.save();

    category.subCategory.push({
      _id: newSubCategory._id,
      name: newSubCategory.name,
    });
    await category.save();

    res.status(201).json({
      data: newSubCategory,
      message: "Subcategory created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const subCategories = await FoodSubCategory.find().populate("category_id");
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const subCategory = await FoodSubCategory.findById(id).populate(
      "category_id"
    );
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { name, category_id } = req.body;

  try {
    const updatedSubCategory = await FoodSubCategory.findByIdAndUpdate(
      id,
      { name, category_id },
      { new: true }
    );
    if (!updatedSubCategory) {
      return res.status(404).json({ message: "Sub Category not found" });
    }

    await FoodCategory.updateOne(
      { "subCategory._id": id },
      { $set: { "subCategory.$.name": name } }
    );

    res.status(200).json(updatedSubCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubCategory = await FoodSubCategory.findByIdAndDelete(id);
    if (!deletedSubCategory) {
      return res.status(201).json({ message: "Sub Category not found" });
    }

    // Delete items in the subcategory

    await FoodItems.deleteMany({
      "category._id": deletedSubCategory._id.toString(),
    });

    const category = await FoodCategory.findByIdAndUpdate(
      deletedSubCategory.category_id,
      { $pull: { subCategory: { _id: deletedSubCategory._id } } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Sub Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
