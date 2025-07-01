const Category = require("../models/categories.model");
const MasterMenu = require("../models/masterMenu.model");
// Create a new category with multiple parent categories
exports.create = async (req, res) => {
  try {
    const { name, parentCategories = [], hasCuisine } = req.body;

    // Verify all parent categories exist
    if (parentCategories.length > 0) {
      const parentCategoriesExist = await Category.find({
        _id: { $in: parentCategories },
      });

      if (parentCategoriesExist.length !== parentCategories.length) {
        return res.status(404).json({
          success: false,
          message: "One or more parent categories not found",
        });
      }
    }

    const category = new Category({
      name,
      parentCategories,
      hasCuisine,
    });

    const savedCategory = await category.save();

    // Populate parent categories details
    const populatedCategory = await Category.findById(
      savedCategory._id
    ).populate("parentCategories", "name");

    res.status(201).json({
      success: true,
      message:
        parentCategories.length > 0
          ? "Subcategory created successfully"
          : "Category created successfully",
      data: populatedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, parentCategories = [], hasCuisine } = req.body;

    // Verify all parent categories exist
    if (parentCategories.length > 0) {
      const parentCategoriesExist = await Category.find({
        _id: { $in: parentCategories },
      });

      if (parentCategoriesExist.length !== parentCategories.length) {
        return res.status(404).json({
          success: false,
          message: "One or more parent categories not found",
        });
      }
    }

    const category = new Category({
      name,
      parentCategories,
      hasCuisine,
    });

    const savedCategory = await category.save();

    // Populate parent categories details
    const populatedCategory = await Category.findById(
      savedCategory._id
    ).populate("parentCategories", "name");

    res.status(201).json({
      success: true,
      message:
        parentCategories.length > 0
          ? "Subcategory created successfully"
          : "Category created successfully",
      data: populatedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    // First, get all main categories (those without parent categories)
    const mainCategories = await Category.find({
      parentCategories: { $size: 0 },
    });

    // Process each main category
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (mainCat) => {
        // Find subcategories of the main category
        const subcategories = await Category.find({
          parentCategories: mainCat._id,
        }).populate("parentCategories", "name");

        // Find items belonging to this main category or its subcategories
        const categoryIds = [
          mainCat._id,
          ...subcategories.map((sub) => sub._id),
        ];
        const items = await MasterMenu.find(
          { category: { $in: categoryIds } },
          "_id"
        );

        // Extract item IDs
        const itemIds = items.map((item) => item._id);

        // Convert main category to a plain object and add item IDs
        const mainCatObj = mainCat.toObject();
        return {
          ...mainCatObj,
          itemIds,
          subcategories: subcategories.map((sub) => {
            return {
              ...sub.toObject(),
              itemIds: itemIds.filter((id) =>
                subcategories.some((sc) => sc._id.equals(sub._id))
              ), // Only relevant item IDs
            };
          }),
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categoriesWithSubs,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get main categories (categories without parents)
exports.findMainCategories = async (req, res) => {
  try {
    const mainCategories = await Category.find({
      parentCategories: { $size: 0 },
    });
    res.status(200).json({
      success: true,
      message: "Main categories retrieved successfully",
      data: mainCategories,
    });
  } catch (error) {
    console.error("Error fetching main categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch main categories",
      error: error.message,
    });
  }
};

// Get subcategories of a specific category
exports.findSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if parent category exists
    const parentCategory = await Category.findById(id);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    // Get all subcategories that have this category as one of their parents
    const subcategories = await Category.find({
      parentCategories: id,
    }).populate("parentCategories", "name");

    res.status(200).json({
      success: true,
      message: "Subcategories retrieved successfully",
      data: {
        parentCategory: {
          _id: parentCategory._id,
          name: parentCategory.name,
        },
        subcategories,
      },
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

// Get a single category by ID
exports.findOne = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategories",
      "name"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // If it's a main category, get its subcategories
    let responseData = category.toObject();
    if (category.parentCategories.length === 0) {
      const subcategories = await Category.find({
        parentCategories: category._id,
      }).populate("parentCategories", "name");
      responseData.subcategories = subcategories;
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// Update a category
exports.update = async (req, res) => {
  try {
    const { id } = req.params; // Get category ID from params
    const { name, parentCategories = [], hasCuisine } = req.body;
    // Check if the category to update exists
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Verify all parent categories exist
    if (parentCategories.length > 0) {
      const parentCategoriesExist = await Category.find({
        _id: { $in: parentCategories },
      });

      if (parentCategoriesExist.length !== parentCategories.length) {
        return res.status(404).json({
          success: false,
          message: "One or more parent categories not found",
        });
      }
    }

    // Update the category fields
    category.name = name || category.name;
    category.parentCategories = parentCategories;
    category.hasCuisine = hasCuisine;

    const updatedCategory = await category.save();

    // Populate parent categories details
    const populatedCategory = await Category.findById(
      updatedCategory._id
    ).populate("parentCategories", "name");

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: populatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete a category
exports.delete = async (req, res) => {
  try {
    // First check if category has subcategories
    const hasSubcategories = await Category.exists({
      parentCategories: req.params.id,
    });

    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with existing subcategories. Delete subcategories first.",
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
