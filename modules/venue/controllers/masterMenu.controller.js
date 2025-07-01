const MasterMenu = require("../models/masterMenu.model");
const Category = require("../models/categories.model");
const Cuisine = require("../models/cuisine.model");
const ItemType = require("../models/itemType.model");
const { default: mongoose } = require("mongoose");
const {
  getTopVariantMenuItemsByEventType,
  filterVariantsWithAggregation,
  mergeResponses,
  restaurantsInLocation,
} = require("../helpers/jobMenu.helper");
const Variant = require("../models/variant.model");
const Package = require("../models/package.model");

// Create a new menu item
exports.create = async (req, res) => {
  try {
    const menuItem = new MasterMenu(req.body);
    const savedMenuItem = await menuItem.save();

    // Populate the saved item with all references
    const populatedMenuItem = await MasterMenu.findById(savedMenuItem._id)
      .populate({
        path: "category",
        populate: {
          path: "parentCategories",
          model: "Category",
        },
      })
      .populate("cuisine");

    // Get subcategories for each category
    const menuItemObj = populatedMenuItem.toObject();
    const categoriesWithSubs = await Promise.all(
      menuItemObj.category.map(async (cat) => {
        if (!cat.parentCategories || cat.parentCategories.length === 0) {
          // If this is a main category, get its subcategories
          const subcategories = await Category.find({
            parentCategories: cat._id,
          }).populate("parentCategories");
          return {
            ...cat,
            subcategories,
          };
        }
        return cat;
      })
    );

    menuItemObj.category = categoriesWithSubs;

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItemObj,
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
      error: error.message,
    });
  }
};

// Get all menu items with optional filters
exports.findAll = async (req, res) => {
  try {
    const query = {};
    if (req.query.foodType) query.foodType = req.query.foodType;
    if (req.query.drinkType) query.drinkType = req.query.drinkType;
    if (req.query.category) query.category = req.query.category;
    if (req.query.cuisine) query.cuisine = req.query.cuisine;
    if (req.query.isAvailable !== undefined)
      query.isAvailable = req.query.isAvailable === "true";

    // Get all categories first
    const allCategories = await Category.find().lean();

    // Organize categories into a hierarchy
    const mainCategories = allCategories.filter(
      (cat) => !cat.parentCategories || cat.parentCategories.length === 0
    );
    const categoriesMap = new Map();

    // Create a map of all categories with their subcategories
    mainCategories.forEach((mainCat) => {
      const subcategories = allCategories.filter(
        (cat) =>
          cat.parentCategories &&
          cat.parentCategories.some(
            (parent) => parent.toString() === mainCat._id.toString()
          )
      );
      categoriesMap.set(mainCat._id.toString(), {
        ...mainCat,
        subcategories,
      });
    });

    // Get menu items with populated fields
    const menuItems = await MasterMenu.find(query)
      .populate({
        path: "category",
        select: "-__v -createdAt -updatedAt",
        populate: {
          path: "parentCategories",
          select: "-__v -createdAt -updatedAt",
        },
      })
      .populate("cuisine", "-__v -createdAt -updatedAt")
      .select("-__v");

    // Process menu items to include full category hierarchy
    const processedMenuItems = menuItems.map((item) => {
      const menuItem = item.toObject();
      menuItem.category = menuItem.category.map((cat) => {
        if (!cat.parentCategories || cat.parentCategories.length === 0) {
          return categoriesMap.get(cat._id.toString()) || cat;
        }
        return cat;
      });
      return menuItem;
    });

    res.status(200).json({
      success: true,
      message: "Menu items retrieved successfully",
      data: processedMenuItems,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};
// Get all menu items with optional filters
exports.findAllWithMiscellaneous = async (req, res) => {
  try {
    const query = {};
    if (req.query.foodType) query.foodType = req.query.foodType;
    if (req.query.drinkType) query.drinkType = req.query.drinkType;
    if (req.query.category) query.category = req.query.category;
    if (req.query.cuisine) query.cuisine = req.query.cuisine;
    if (req.query.isAvailable !== undefined)
      query.isAvailable = req.query.isAvailable === "true";

    // Get all categories first
    const allCategories = await Category.find().lean();

    // Create a map for quick category lookups
    const categoryMap = new Map(
      allCategories.map((cat) => [cat._id.toString(), cat])
    );

    // Identify main categories (those without parent categories)
    const mainCategories = allCategories.filter(
      (cat) => !cat.parentCategories || cat.parentCategories.length === 0
    );

    // For each main category, ensure it has a corresponding subcategory
    const subcategoriesForMainCategories = mainCategories.map((mainCat) => {
      // Check if a subcategory with the same ID already exists
      const existingSubcat = allCategories.find(
        (cat) =>
          cat.parentCategories &&
          cat.parentCategories.some(
            (parent) => parent.toString() === mainCat._id.toString()
          ) &&
          cat._id.toString() === mainCat._id.toString()
      );

      if (!existingSubcat) {
        // If no matching subcategory exists, create a virtual one
        return {
          ...mainCat,
          parentCategories: [mainCat._id],
          isVirtualSubcategory: true, // Flag to identify virtually created subcategories
        };
      }
      return existingSubcat;
    });

    // Combine all subcategories
    const allSubcategories = [
      ...subcategoriesForMainCategories,
      ...allCategories.filter(
        (cat) =>
          cat.parentCategories &&
          cat.parentCategories.length > 0 &&
          !subcategoriesForMainCategories.some(
            (sc) => sc._id.toString() === cat._id.toString()
          )
      ),
    ];

    // Create the final category hierarchy
    const categoriesMap = new Map();
    mainCategories.forEach((mainCat) => {
      const subcategories = allSubcategories.filter(
        (cat) =>
          cat.parentCategories &&
          cat.parentCategories.some(
            (parent) => parent.toString() === mainCat._id.toString()
          )
      );

      categoriesMap.set(mainCat._id.toString(), {
        ...mainCat,
        subcategories,
      });
    });

    // Get menu items with populated fields
    const menuItems = await MasterMenu.find(query)
      .populate({
        path: "category",
        select: "-__v -createdAt -updatedAt",
        populate: {
          path: "parentCategories",
          select: "-__v -createdAt -updatedAt",
        },
      })
      .populate("cuisine", "-__v -createdAt -updatedAt")
      .select("-__v");

    // Process menu items to include full category hierarchy
    const processedMenuItems = menuItems.map((item) => {
      const menuItem = item.toObject();

      // Process each category of the menu item
      menuItem.category = menuItem.category.map((cat) => {
        const categoryId = cat._id.toString();

        if (!cat.parentCategories || cat.parentCategories.length === 0) {
          // For items directly under a main category, associate them with the corresponding subcategory
          const mainCategory = categoriesMap.get(categoryId);
          if (mainCategory) {
            // Find or create the virtual subcategory
            const virtualSubcategory = mainCategory.subcategories.find(
              (sub) => sub._id.toString() === categoryId
            );

            if (virtualSubcategory) {
              return {
                ...virtualSubcategory,
                name: "Miscellaneous",
                parentCategories: [mainCategory],
              };
            }
          }
        }

        // For items already in subcategories, ensure they have the full category hierarchy
        const parentCategory = cat.parentCategories?.[0];
        if (parentCategory) {
          const fullParentCategory = categoriesMap.get(
            parentCategory.toString()
          );
          if (fullParentCategory) {
            return {
              ...cat,
              parentCategories: [fullParentCategory],
            };
          }
        }

        return cat;
      });

      return menuItem;
    });

    res.status(200).json({
      success: true,
      message: "Menu items retrieved successfully",
      data: processedMenuItems,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

// Get a single menu item by ID
exports.findOne = async (req, res) => {
  try {
    const menuItem = await MasterMenu.findById(req.params.id)
      .populate({
        path: "category",
        populate: {
          path: "parentCategories",
          model: "Category",
        },
      })
      .populate("cuisine");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Process categories with subcategories
    const menuItemObj = menuItem.toObject();
    const categoriesWithSubs = await Promise.all(
      menuItemObj.category.map(async (cat) => {
        if (!cat.parentCategories || cat.parentCategories.length === 0) {
          const subcategories = await Category.find({
            parentCategories: cat._id,
          }).populate("parentCategories");
          return {
            ...cat,
            subcategories,
          };
        }
        return cat;
      })
    );

    menuItemObj.category = categoriesWithSubs;

    res.status(200).json({
      success: true,
      message: "Menu item retrieved successfully",
      data: menuItemObj,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
      error: error.message,
    });
  }
};

// Update a menu item
exports.update = async (req, res) => {
  try {
    const menuItem = await MasterMenu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({
        path: "category",
        populate: {
          path: "parentCategories",
          model: "Category",
        },
      })
      .populate("cuisine");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Process categories
    const menuItemObj = menuItem.toObject();
    const processedCategories = await Promise.all(
      menuItemObj.category.map(async (cat) => {
        if (!cat.parentCategories || cat.parentCategories.length === 0) {
          const subcategories = await Category.find({
            parentCategories: cat._id,
          }).populate("parentCategories");
          return {
            ...cat,
            subcategories,
          };
        }
        return cat;
      })
    );

    menuItemObj.category = processedCategories;

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItemObj,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
      error: error.message,
    });
  }
};

// Delete a menu item
exports.delete = async (req, res) => {
  try {
    const menuItem = await MasterMenu.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
      error: error.message,
    });
  }
};

// Add this function to the existing controller
exports.importBulk = async (req, res) => {
  try {
    const menuItems = req.body;
    const results = {
      success: [],
      errors: [],
    };

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid menu items provided",
      });
    }

    for (const item of menuItems) {
      try {
        // Validate and clean the data
        const cleanedItem = await validateAndCleanMenuData(item);

        // Create the menu item
        const menuItem = new MasterMenu(cleanedItem);
        const savedItem = await menuItem.save();

        results.success.push({
          name: item.name,
          id: savedItem._id,
        });
      } catch (error) {
        results.errors.push({
          name: item.name || "Unknown item",
          error: error.message,
        });
      }
    }

    const successCount = results.success.length;
    const errorCount = results.errors.length;

    res.status(200).json({
      success: successCount > 0,
      message: `Imported ${successCount} items successfully${
        errorCount > 0 ? `. Failed to import ${errorCount} items` : ""
      }`,
      results,
    });
  } catch (error) {
    console.error("Error importing menu items:", error);
    res.status(500).json({
      success: false,
      message: "Error importing menu items",
      error: error.message,
    });
  }
};

// Helper function to validate and clean menu data
async function validateAndCleanMenuData(item) {
  try {
    // Basic validation
    if (!item.name) {
      throw new Error("Name is required");
    }

    // Convert itemTypes from names to IDs
    const itemTypeIds = await Promise.all(
      (item.itemTypes || "").split(",").map(async (name) => {
        const itemType = await ItemType.findOne({
          name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
          isActive: true,
        });
        if (!itemType)
          throw new Error(`Item type not found or inactive: ${name.trim()}`);
        return itemType._id;
      })
    );

    // Convert categories from names to IDs
    const categoryIds = await Promise.all(
      (item.categories || "").split(",").map(async (name) => {
        const category = await Category.findOne({
          name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });
        if (!category) throw new Error(`Category not found: ${name.trim()}`);
        return category._id;
      })
    );

    // Convert cuisines from names to IDs
    const cuisineIds = await Promise.all(
      (item.cuisines || "").split(",").map(async (name) => {
        const cuisine = await Cuisine.findOne({
          name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });
        if (!cuisine) throw new Error(`Cuisine not found: ${name.trim()}`);
        return cuisine._id;
      })
    );

    // Ensure at least one item type is specified
    if (!itemTypeIds.length) {
      throw new Error("At least one valid item type must be specified");
    }

    return {
      name: item.name.trim(),
      description: item.description?.trim() || "",
      itemTypes: itemTypeIds,
      category: categoryIds,
      cuisine: cuisineIds,
      isAvailable: item.isAvailable === "true" || item.isAvailable === true,
    };
  } catch (error) {
    throw new Error(
      `Validation error for item "${item.name}": ${error.message}`
    );
  }
}
exports.countData = async (req, res) => {
  try {
    let {
      eventTypeId,
      locations,
      variantIds = [],
      radius = 100,
      latitude,
      longitude,
      minBudget,
      maxBudget,
      minPerson,
      maxPerson,
      personRangeMatchType = "loose",
      budgetRangeMatchType = "loose",
      cuisineMatchThreshold = 0.6,
      cuisineIds = [],
      vegOnly = false,
      strictLocationCheck = true,
      nonAlcoholicOnly = false,
    } = req.body;

    minPerson = parseInt(minPerson || 0);
    maxPerson = parseInt(maxPerson) || Infinity;
    minBudget = parseInt(minBudget || 0);
    maxBudget = parseInt(maxBudget) || Infinity;

    const cuisineIdSet = new Set(cuisineIds.map((c) => c.toString()));

    // Query conditions
    let personQuery = {};
    if (personRangeMatchType === "strict") {
      personQuery = {
        minPersons: { $lte: minPerson },
        maxPersons: { $gte: maxPerson },
      };
    } else if (personRangeMatchType === "exact") {
      personQuery = {
        minPersons: { $gte: minPerson },
        maxPersons: { $lte: maxPerson },
      };
    } else {
      personQuery = {
        minPersons: { $lte: maxPerson },
        maxPersons: { $gte: minPerson },
      };
    }

    let costFilter = {};
    if (budgetRangeMatchType === "strict") {
      costFilter = { $gte: minBudget, $lte: maxBudget };
    } else if (budgetRangeMatchType === "exact") {
      costFilter = { $eq: (minBudget + maxBudget) / 2 };
    } else {
      costFilter = { $lte: maxBudget, $gte: minBudget };
    }

    const filterVariantsByCuisineMatch = (variants) => {
      if (cuisineIds.length === 0) return variants;

      return variants.filter((variant) => {
        const menuItems = variant.menuItems || [];
        const matchedCount = menuItems.filter((item) =>
          (item.cuisine || []).some((c) => cuisineIdSet.has(c.toString()))
        ).length;

        const matchRatio =
          menuItems.length > 0 ? matchedCount / menuItems.length : 0;
        return matchRatio >= cuisineMatchThreshold;
      });
    };

    let variants = [];

    if (variantIds.length > 0) {
      // ✅ Directly fetch variants by variantIds
      variants = await Variant.find({ _id: { $in: variantIds } })
        .populate({
          path: "menuItems",
          populate: [
            { path: "category", populate: { path: "parentCategories" } },
            { path: "itemTypes" },
          ],
        })
        .sort({ cost: 1 });

      variants = filterVariantsByCuisineMatch(variants);
    } else {
      let restaurantIds = [];

      if (locations?.length > 0) {
        restaurantIds =
          (await restaurantsInLocation({
            locations,
            radius,
            latitude,
            longitude,
          })) || [];
      }

      if (restaurantIds.length > 0) {
        const packages = await Package.find({
          venueId: { $in: restaurantIds },
          ...(eventTypeId && { eventType: { $in: [eventTypeId] } }),
        });

        if (packages.length > 0) {
          const packageIds = packages.map((pkg) => pkg._id);
          variants = await Variant.find({
            isCustomized: false,
            $or: [
              { jobSpecificId: null },
              { jobSpecificId: { $exists: false } },
            ],
            packageId: { $in: packageIds },
            ...personQuery,
            ...(Object.keys(costFilter).length > 0 && { cost: costFilter }),
          })
            .populate({
              path: "menuItems",
              populate: [
                { path: "category", populate: { path: "parentCategories" } },
                { path: "itemTypes" },
              ],
            })
            .sort({ cost: 1 });

          variants = filterVariantsByCuisineMatch(variants);
        }
      }

      if (!strictLocationCheck && variants.length === 0) {
        const packages = await Package.find({
          ...(eventTypeId && { eventType: { $in: [eventTypeId] } }),
        });

        if (packages.length > 0) {
          const packageIds = packages.map((pkg) => pkg._id);
          variants = await Variant.find({
            isCustomized: false,
            $or: [
              { jobSpecificId: null },
              { jobSpecificId: { $exists: false } },
            ],
            packageId: { $in: packageIds },
            maxPersons: { $gte: minPerson },
            minPersons: { $lte: maxPerson },
            ...(Object.keys(costFilter).length > 0 && { cost: costFilter }),
          })
            .populate({
              path: "menuItems",
              populate: [
                { path: "category", populate: { path: "parentCategories" } },
                { path: "itemTypes" },
              ],
            })
            .sort({ cost: 1 });

          variants = filterVariantsByCuisineMatch(variants);
        }
      }
    }

    const cuisines =
      variantIds.length > 0
        ? await Cuisine.find({})
        : await Cuisine.find({ _id: { $in: cuisineIds } });
    const cuisineNames = cuisines.map((cuisine) => cuisine.name);
    const menuCountsByVariants = variants.map(
      (variant) => variant.availableMenuCount
    );

    const result = mergeResponses(menuCountsByVariants, {
      cuisineNames: [...cuisineNames, "Other"],
      vegOnly,
      nonAlcoholicOnly,
    });

    res.status(200).json({
      data: result,
      customizeText:
        result?.length !== 0
          ? ""
          : "No variants found matching your criteria. Please try with different parameters.",
    });
  } catch (error) {
    console.error("Error in countData:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// exports.countData = async (req, res) => {
//   try {
//     // Extract eventTypeId, and safely handle cuisineNames
//     const {
//       eventTypeId,
//       locations,
//       radius = 100,
//       latitude,
//       longitude,
//       vegOnly = false,
//     } = req.body;
//     // Explicitly check if cuisineNames exists and is an array
//     let cuisineNames = Array.isArray(req.body.cuisineNames)
//       ? req.body.cuisineNames
//       : [];
//     if (cuisineNames.length > 0) {
//       cuisineNames = [...cuisineNames, "Other"];
//     }
//     let itemIds =
//       (await getTopVariantMenuItemsByEventType({
//         eventTypeId,
//         locations,
//         radius,
//         latitude,
//         longitude,
//         vegOnly,
//       })) ?? [];
//     let customizeText = "";
//     // When no itemIds are provided, find relevant items through aggregation
//     if (itemIds.length === 0) {
//       const packages = await Package.find({
//         eventType: {
//           $in: [eventTypeId],
//         },
//       });
//       const variantByPackages = await Variant.find({
//         packageId: {
//           $in: packages.map((pkg) => pkg._id),
//         },
//       }).sort({ cost: 1 });
//       const selectedVariants = variantByPackages
//         .filter(
//           (variant) =>
//             Array.isArray(variant?.menuItems) && variant.menuItems.length > 0
//         )
//         .slice(0, 5);

//       // Extract all item IDs from those variants
//       itemIds = selectedVariants.flatMap((variant) => variant.menuItems);

//       customizeText =
//         "We are offering this package from our end as our ai is not able to provide the data according to your location. You can customize your data as per your requirements.";
//     }

//     // Build the initial match stage for available items
//     let matchStage = vegOnly
//       ? {
//           isAvailable: true,
//           itemTypes: {
//             $nin: [
//               new mongoose.Types.ObjectId("67aecd22d3af1523c01ee922"),
//               new mongoose.Types.ObjectId("67f760ba1dd04569e7bbe2fd"),
//             ],
//           },
//         }
//       : {
//           isAvailable: true,
//         };

//     // Get all menu items to calculate maximum counts
//     const allMenuItems = await MasterMenu.find(matchStage)
//       .populate("category")
//       .populate("itemTypes")
//       .populate("cuisine")
//       .lean();

//     // Create a map to track maximum counts for each subcategory
//     const subcategoryMaxCountMap = new Map();

//     // Process all menu items to determine maximum counts for subcategories
//     for (const item of allMenuItems) {
//       const categories = Array.isArray(item.category)
//         ? item.category
//         : [item.category].filter(Boolean);

//       // Process subcategories
//       for (const category of categories) {
//         if (!category) continue;

//         // Skip if not a subcategory
//         if (
//           !category.parentCategories ||
//           category.parentCategories.length === 0
//         )
//           continue;

//         const subCatId = category._id.toString();

//         if (!subcategoryMaxCountMap.has(subCatId)) {
//           subcategoryMaxCountMap.set(subCatId, {
//             count: {},
//             total: 0,
//           });
//         }

//         const maxCountData = subcategoryMaxCountMap.get(subCatId);

//         // Count item types
//         const itemTypes = Array.isArray(item.itemTypes) ? item.itemTypes : [];
//         for (const itemType of itemTypes) {
//           if (!itemType || itemType.name === "N/A") continue;

//           if (!maxCountData.count[itemType.name]) {
//             maxCountData.count[itemType.name] = 0;
//           }
//           maxCountData.count[itemType.name]++;
//           maxCountData.total++;
//         }
//       }
//     }

//     // Add item ID filtering if provided for the actual results
//     if (itemIds && itemIds.length > 0) {
//       // Filter valid ObjectIds
//       const validItemIds = itemIds
//         .filter((id) => mongoose.Types.ObjectId.isValid(id))
//         .map((id) => new mongoose.Types.ObjectId(id));

//       if (validItemIds.length > 0) {
//         matchStage._id = { $in: validItemIds };
//       }
//     }

//     // Get all categories, item types, and cuisines for reference
//     let [categories, itemTypes, cuisines] = await Promise.all([
//       Category.find().lean(),
//       ItemType.find({ name: { $ne: "N/A" } }).lean(),
//       Cuisine.find().lean(),
//     ]);
//     itemTypes = vegOnly
//       ? itemTypes.filter(
//           (type) =>
//             type._id.toString() !== "67aecd22d3af1523c01ee922" &&
//             type._id.toString() !== "67f760ba1dd04569e7bbe2fd"
//         )
//       : itemTypes;
//     // Create lookup maps for reference data
//     const categoryMap = new Map(
//       categories.map((cat) => [cat._id.toString(), cat])
//     );

//     const itemTypeMap = new Map(
//       itemTypes.map((type) => [type._id.toString(), type])
//     );
//     // Group item types by their category
//     const itemTypesByCategoryMap = new Map();
//     itemTypes.forEach((type) => {
//       const categoryId = type.category
//         ? type.category.toString()
//         : "uncategorized";

//       if (!itemTypesByCategoryMap.has(categoryId)) {
//         itemTypesByCategoryMap.set(categoryId, []);
//       }

//       itemTypesByCategoryMap.get(categoryId).push({
//         id: type._id.toString(),
//         name: type.name,
//       });
//     });

//     // Aggregation pipeline for menu items
//     const menuItems = await MasterMenu.aggregate([
//       // Stage 1: Match available items (and any item IDs if specified)
//       { $match: matchStage },

//       // Stage 2: Lookup related categories
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "categoryData",
//         },
//       },

//       // Stage 3: Lookup related item types
//       {
//         $lookup: {
//           from: "itemtypes",
//           localField: "itemTypes",
//           foreignField: "_id",
//           as: "itemTypeData",
//         },
//       },

//       // Stage 4: Lookup related cuisines
//       {
//         $lookup: {
//           from: "cuisines",
//           localField: "cuisine",
//           foreignField: "_id",
//           as: "cuisineData",
//         },
//       },

//       // Stage 5: Project fields we need
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           description: { $ifNull: ["$description", ""] },
//           categoryData: 1,
//           itemTypeData: {
//             $filter: {
//               input: "$itemTypeData",
//               as: "type",
//               cond: { $ne: ["$$type.name", "N/A"] },
//             },
//           },
//           cuisineData: {
//             $cond: {
//               if: { $eq: [{ $size: "$cuisineData" }, 0] },
//               then: [{ name: "Other" }],
//               else: "$cuisineData",
//             },
//           },
//         },
//       },
//     ]);

//     // Process the aggregated data to build our result structure
//     const mainCategoriesMap = new Map();

//     // Helper function to check if item should be included based on cuisine
//     const shouldIncludeItemByCuisine = (cuisineData) => {
//       if (cuisineNames.length === 0) return true; // No cuisine filter applied

//       // If cuisineData is empty or has length 0, always include it under "Other"
//       // rather than filtering it out
//       if (!cuisineData || cuisineData.length === 0) {
//         return true; // Always include items without cuisine
//       }

//       // Check if any of the item's cuisines match our filter
//       return cuisineData.some((cuisine) =>
//         cuisineNames.includes(cuisine.name || "Other")
//       );
//     };

//     // Process each menu item
//     for (const item of menuItems) {
//       // Skip items that don't match cuisine filter
//       if (!shouldIncludeItemByCuisine(item.cuisineData)) {
//         continue;
//       }

//       // Extract data from the aggregation result
//       const itemInfo = {
//         id: item._id.toString(),
//         name: item.name,
//         description: item.description,
//         itemTypes: item.itemTypeData.map((type) => type.name),
//       };

//       const itemTypeIds = item.itemTypeData.map((type) => type._id.toString());

//       // Process direct categories (main categories)
//       const directCategories = item.categoryData.filter(
//         (cat) => !cat.parentCategories || cat.parentCategories.length === 0
//       );

//       // Process each direct category
//       for (const category of directCategories) {
//         const catId = category._id.toString();

//         if (!mainCategoriesMap.has(catId)) {
//           mainCategoriesMap.set(catId, {
//             categoryId: catId,
//             name: category.name,
//             total: 0,
//             directTotal: 0, // Track direct items separately
//             count: {},
//             subcategoriesByCuisine: {},
//             items: [],
//           });
//         }

//         const mainCategoryData = mainCategoriesMap.get(catId);
//         mainCategoryData.items.push(itemInfo);

//         // Update counts for item types
//         for (const typeId of itemTypeIds) {
//           const itemType = itemTypeMap.get(typeId);
//           if (itemType) {
//             if (!mainCategoryData.count[itemType.name]) {
//               mainCategoryData.count[itemType.name] = 0;
//             }
//             mainCategoryData.count[itemType.name]++;
//             mainCategoryData.directTotal++; // Count direct items separately
//           }
//         }
//       }

//       // Process subcategories
//       const subcategories = item.categoryData.filter(
//         (cat) => cat.parentCategories && cat.parentCategories.length > 0
//       );

//       // In the section where you process subcategories
//       for (const subcategory of subcategories) {
//         const subCatId = subcategory._id.toString();

//         // Process each parent category of this subcategory
//         for (const parentCatId of subcategory.parentCategories.map((id) =>
//           id.toString()
//         )) {
//           const parentCategory = categoryMap.get(parentCatId);
//           if (!parentCategory) continue;

//           if (!mainCategoriesMap.has(parentCatId)) {
//             mainCategoriesMap.set(parentCatId, {
//               categoryId: parentCatId,
//               name: parentCategory.name,
//               total: 0,
//               directTotal: 0, // Track direct items separately
//               count: {},
//               subcategoriesByCuisine: {},
//               items: [],
//             });
//           }

//           const mainCategoryData = mainCategoriesMap.get(parentCatId);

//           // Process each cuisine - ensure empty cuisines are categorized as "Other"
//           const cuisinesToProcess =
//             item.cuisineData.length === 0
//               ? [{ name: "Other" }]
//               : item.cuisineData;

//           for (const cuisine of cuisinesToProcess) {
//             const cuisineName = cuisine.name || "Other";

//             // Skip cuisines not in the filter if a filter is provided
//             if (
//               cuisineNames.length > 0 &&
//               !cuisineNames.includes(cuisineName)
//             ) {
//               continue;
//             }

//             // Initialize cuisine section if not exists
//             if (!mainCategoryData.subcategoriesByCuisine[cuisineName]) {
//               mainCategoryData.subcategoriesByCuisine[cuisineName] = [];
//             }

//             // Find subcategory in the cuisine section or create it
//             let subCategoryData = mainCategoryData.subcategoriesByCuisine[
//               cuisineName
//             ].find((sub) => sub.subcategoryId === subCatId);

//             if (!subCategoryData) {
//               // Get maximum counts from our pre-calculated map
//               const maxCountData = subcategoryMaxCountMap.get(subCatId) || {
//                 count: {},
//                 total: 0,
//               };

//               subCategoryData = {
//                 subcategoryId: subCatId,
//                 name: subcategory.name,
//                 total: 0,
//                 count: {},
//                 maxCount: { ...maxCountData.count }, // Add maxCount property with a copy of the counts
//                 maxTotal: maxCountData.total, // Add maxTotal property
//                 items: [],
//               };
//               mainCategoryData.subcategoriesByCuisine[cuisineName].push(
//                 subCategoryData
//               );
//             }

//             // Add item to subcategory
//             subCategoryData.items.push(itemInfo);

//             // Update counts for item types
//             for (const typeId of itemTypeIds) {
//               const itemType = itemTypeMap.get(typeId);
//               if (itemType) {
//                 if (!subCategoryData.count[itemType.name]) {
//                   subCategoryData.count[itemType.name] = 0;
//                 }
//                 subCategoryData.count[itemType.name]++;
//                 subCategoryData.total++;
//               }
//             }
//           }
//         }
//       }
//     }
//     // Post-processing: add related item types and ensure consistent structure
//     for (const mainCategory of mainCategoriesMap.values()) {
//       // Get all item type categories used in this main category
//       const usedItemTypes = Object.keys(mainCategory.count);
//       const usedItemTypeIds = itemTypes
//         .filter((type) => usedItemTypes.includes(type.name))
//         .map((type) => type._id.toString());

//       // Find all item type categories
//       const itemTypeCategories = new Set();
//       for (const typeId of usedItemTypeIds) {
//         const itemType = itemTypeMap.get(typeId);
//         if (itemType && itemType.category) {
//           itemTypeCategories.add(itemType.category.toString());
//         }
//       }

//       // Add all related item types with the same category
//       for (const typeCategoryId of itemTypeCategories) {
//         const relatedTypes = itemTypesByCategoryMap.get(typeCategoryId) || [];
//         for (const relatedType of relatedTypes) {
//           if (!mainCategory.count.hasOwnProperty(relatedType.name)) {
//             mainCategory.count[relatedType.name] = 0;
//           }
//         }
//       }

//       // Calculate total from direct items and subcategories
//       let subcategoryTotal = 0;

//       // Apply the same process to each subcategory and calculate totals
//       Object.values(mainCategory.subcategoriesByCuisine).forEach(
//         (subcategories) => {
//           subcategories.forEach((subcategory) => {
//             // Get all item type categories used in this subcategory
//             const usedSubItemTypes = Object.keys(subcategory.count);
//             const usedSubItemTypeIds = itemTypes
//               .filter((type) => usedSubItemTypes.includes(type.name))
//               .map((type) => type._id.toString());

//             // Find all item type categories
//             const subItemTypeCategories = new Set();
//             for (const typeId of usedSubItemTypeIds) {
//               const itemType = itemTypeMap.get(typeId);
//               if (itemType && itemType.category) {
//                 subItemTypeCategories.add(itemType.category.toString());
//               }
//             }

//             // Add all related item types with the same category
//             for (const typeCategoryId of subItemTypeCategories) {
//               const relatedTypes =
//                 itemTypesByCategoryMap.get(typeCategoryId) || [];
//               for (const relatedType of relatedTypes) {
//                 if (!subcategory.count.hasOwnProperty(relatedType.name)) {
//                   subcategory.count[relatedType.name] = 0;
//                 }

//                 // Also ensure these types exist in maxCount if they don't already
//                 if (!subcategory.maxCount.hasOwnProperty(relatedType.name)) {
//                   subcategory.maxCount[relatedType.name] = 0;
//                 }
//               }
//             }

//             // Add subcategory total to accumulated total

//             subcategoryTotal += subcategory.total;
//           });
//         }
//       );

//       // Set the main category total to the sum of direct items and subcategory totals
//       mainCategory.total = mainCategory.directTotal + subcategoryTotal;
//       // mainCategory.total = subcategoryTotal;

//       // Remove the temporary tracking property
//       delete mainCategory.directTotal;
//     }
//     // console.log({ mainCategoriesMap });

//     // Convert map to array for response
//     let result = Array.from(mainCategoriesMap.values());
//     // filter out who hase no values
//     // result = result.filter(
//     //   (category) =>
//     //     category.total > 0 &&
//     //     Object.keys(category?.subcategoriesByCuisine)?.length > 0
//     // );
//     res.status(200).json({ data: result, customizeText });
//   } catch (error) {
//     console.error("Error in countData:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

const countDataByIds = async (req, res) => {
  try {
    const itemIds = req.body.itemIds || []; // Get itemIds directly from req.body
    const { vegOnly = false, resetData = true } = req.body;

    // Check if cuisineIds exists and is an array
    const cuisineIds = Array.isArray(req.body.cuisineIds)
      ? req.body.cuisineIds
      : [];

    // If no itemIds provided in request, fetch them
    let finalItemIds = itemIds;

    // Build the match stage based on provided itemIds
    let matchStage = vegOnly
      ? {
          isAvailable: true,
          itemTypes: {
            $nin: [
              new mongoose.Types.ObjectId("67aecd22d3af1523c01ee922"),
              new mongoose.Types.ObjectId("67f760ba1dd04569e7bbe2fd"),
            ],
          },
        }
      : {
          isAvailable: true,
        };

    // Filter valid ObjectIds for items
    const validItemIds = finalItemIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validItemIds.length > 0) {
      matchStage._id = { $in: validItemIds };
    }

    // Get all categories, item types, and cuisines for reference
    let [categories, itemTypes, cuisines] = await Promise.all([
      Category.find().lean(),
      ItemType.find({ name: { $ne: "N/A" } }).lean(),
      Cuisine.find().lean(),
    ]);
    itemTypes = vegOnly
      ? itemTypes.filter(
          (type) =>
            type._id.toString() !== "67aecd22d3af1523c01ee922" &&
            type._id.toString() !== "67f760ba1dd04569e7bbe2fd"
        )
      : itemTypes;

    // Create lookup maps for reference data
    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat])
    );

    const itemTypeMap = new Map(
      itemTypes.map((type) => [type._id.toString(), type])
    );

    // Create cuisine lookup maps for ID to name and name to ID
    const cuisineIdToNameMap = new Map(
      cuisines.map((cuisine) => [
        cuisine._id.toString(),
        cuisine.name || "Other",
      ])
    );

    const cuisineNameToIdMap = new Map(
      cuisines.map((cuisine) => [
        cuisine.name || "Other",
        cuisine._id.toString(),
      ])
    );

    // Group item types by their category
    const itemTypesByCategoryMap = new Map();
    itemTypes.forEach((type) => {
      const categoryId = type.category
        ? type.category.toString()
        : "uncategorized";

      if (!itemTypesByCategoryMap.has(categoryId)) {
        itemTypesByCategoryMap.set(categoryId, []);
      }

      itemTypesByCategoryMap.get(categoryId).push({
        id: type._id.toString(),
        name: type.name,
      });
    });

    // Filter valid ObjectIds for cuisines
    const validCuisineIds = cuisineIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => id.toString());

    // Aggregation pipeline for menu items
    const menuItems = await MasterMenu.aggregate([
      // Stage 1: Match items by ID (no isAvailable check when itemIds provided)
      { $match: matchStage },

      // Stage 2: Lookup related categories
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      // Stage 3: Lookup related item types
      {
        $lookup: {
          from: "itemtypes",
          localField: "itemTypes",
          foreignField: "_id",
          as: "itemTypeData",
        },
      },

      // Stage 4: Lookup related cuisines
      {
        $lookup: {
          from: "cuisines",
          localField: "cuisine",
          foreignField: "_id",
          as: "cuisineData",
        },
      },

      // Stage 5: Project fields we need
      {
        $project: {
          _id: 1,
          name: 1,
          description: { $ifNull: ["$description", ""] },
          categoryData: 1,
          itemTypeData: {
            $filter: {
              input: "$itemTypeData",
              as: "type",
              cond: { $ne: ["$$type.name", "N/A"] },
            },
          },
          cuisineData: {
            $cond: {
              if: { $eq: [{ $size: "$cuisineData" }, 0] },
              then: [{ name: "Other", _id: null }],
              else: "$cuisineData",
            },
          },
        },
      },
    ]);

    // Process the aggregated data to build our result structure
    const mainCategoriesMap = new Map();

    // Process each menu item
    for (const item of menuItems) {
      // Extract data from the aggregation result
      const itemInfo = {
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        itemTypes: item.itemTypeData.map((type) => type.name),
      };

      const itemTypeIds = item.itemTypeData.map((type) => type._id.toString());

      // Process direct categories (main categories)
      const directCategories = item.categoryData.filter(
        (cat) => !cat.parentCategories || cat.parentCategories.length === 0
      );

      // Process each direct category
      for (const category of directCategories) {
        const catId = category._id.toString();

        if (!mainCategoriesMap.has(catId)) {
          mainCategoriesMap.set(catId, {
            categoryId: catId,
            name: category.name,
            total: 0,
            directTotal: 0, // Track direct items separately
            count: {},
            subcategoriesByCuisine: {},
            items: [],
          });
        }

        const mainCategoryData = mainCategoriesMap.get(catId);
        mainCategoryData.items.push(itemInfo);

        // -----------------------------------//
        // Add all items in category
        if (resetData) {
          const catItems = await MasterMenu.find({
            category: { $in: [catId] },
          }).populate("itemTypes", "name"); // assuming the field is itemTypeIds

          const formattedItems = catItems
            .map((item) => ({
              id: item?._id?.toString(),
              name: item?.name,
              description: item?.description,
              itemTypes: item.itemTypes?.map((type) => type.name) || [],
            }))
            ?.filter((item) => item?.id !== itemInfo?.id);
          mainCategoryData.items = [
            ...mainCategoryData.items,
            ...formattedItems,
          ];
        }

        // -----------------------------------//
        // Update counts for item types
        for (const typeId of itemTypeIds) {
          const itemType = itemTypeMap.get(typeId);
          if (itemType) {
            if (!mainCategoryData.count[itemType.name]) {
              mainCategoryData.count[itemType.name] = 0;
            }
            mainCategoryData.count[itemType.name]++;
            mainCategoryData.directTotal++; // Count direct items separately
          }
        }
      }

      // Process subcategories
      const subcategories = item.categoryData.filter(
        (cat) => cat.parentCategories && cat.parentCategories.length > 0
      );

      // Process each subcategory
      for (const subcategory of subcategories) {
        const subCatId = subcategory._id.toString();

        // Process each parent category of this subcategory
        for (const parentCatId of subcategory.parentCategories.map((id) =>
          id.toString()
        )) {
          const parentCategory = categoryMap.get(parentCatId);
          if (!parentCategory) continue;

          if (!mainCategoriesMap.has(parentCatId)) {
            mainCategoriesMap.set(parentCatId, {
              categoryId: parentCatId,
              name: parentCategory.name,
              total: 0,
              directTotal: 0, // Track direct items separately
              count: {},
              subcategoriesByCuisine: {},
              items: [],
            });
          }

          const mainCategoryData = mainCategoriesMap.get(parentCatId);

          // Process each cuisine
          for (const cuisine of item.cuisineData) {
            const cuisineName = cuisine.name || "Other";
            const cuisineId = cuisine._id ? cuisine._id.toString() : "other";

            // Determine which cuisine to use based on filtering
            let useCuisineName = cuisineName;

            // If cuisineIds are provided and this cuisine doesn't match, use "Other" instead
            if (
              validCuisineIds.length > 0 &&
              !validCuisineIds.includes(cuisineId)
            ) {
              useCuisineName = "Other";
            }

            // Initialize cuisine section if not exists
            if (!mainCategoryData.subcategoriesByCuisine[useCuisineName]) {
              mainCategoryData.subcategoriesByCuisine[useCuisineName] = [];
            }

            // Find subcategory in the cuisine section or create it
            let subCategoryData = mainCategoryData.subcategoriesByCuisine[
              useCuisineName
            ].find((sub) => sub.subcategoryId === subCatId);

            if (!subCategoryData) {
              subCategoryData = {
                subcategoryId: subCatId,
                name: subcategory.name,
                total: 0,
                count: {},
                items: [],
              };
              mainCategoryData.subcategoriesByCuisine[useCuisineName].push(
                subCategoryData
              );
            }

            // Add item to subcategory
            subCategoryData.items.push(itemInfo);

            // -----------------------------------//
            if (resetData) {
              // Add all items in subcategory
              const subCatItems = await MasterMenu.find({
                category: { $in: [subCatId] },
              }).populate("itemTypes", "name"); // assuming the field is itemTypeIds

              const subFormattedItems = subCatItems
                .map((item) => ({
                  id: item._id.toString(),
                  name: item.name,
                  description: item.description,
                  itemTypes: item.itemTypes?.map((type) => type.name) || [],
                }))
                ?.filter((item) => item?.id !== itemInfo?.id);
              subCategoryData.items = [
                ...subCategoryData.items,
                ...subFormattedItems,
              ];
            }

            // -----------------------------------//
            // Update counts for item types
            for (const typeId of itemTypeIds) {
              const itemType = itemTypeMap.get(typeId);
              if (itemType) {
                if (!subCategoryData.count[itemType.name]) {
                  subCategoryData.count[itemType.name] = 0;
                }
                subCategoryData.count[itemType.name]++;
                subCategoryData.total++;
              }
            }
          }
        }
      }
    }

    // Post-processing: add related item types and ensure consistent structure
    for (const mainCategory of mainCategoriesMap.values()) {
      // Get all item type categories used in this main category
      const usedItemTypes = Object.keys(mainCategory.count);
      const usedItemTypeIds = itemTypes
        .filter((type) => usedItemTypes.includes(type.name))
        .map((type) => type._id.toString());

      // Find all item type categories
      const itemTypeCategories = new Set();
      for (const typeId of usedItemTypeIds) {
        const itemType = itemTypeMap.get(typeId);
        if (itemType && itemType.category) {
          itemTypeCategories.add(itemType.category.toString());
        }
      }

      // Add all related item types with the same category
      for (const typeCategoryId of itemTypeCategories) {
        const relatedTypes = itemTypesByCategoryMap.get(typeCategoryId) || [];
        for (const relatedType of relatedTypes) {
          if (!mainCategory.count.hasOwnProperty(relatedType.name)) {
            mainCategory.count[relatedType.name] = 0;
          }
        }
      }

      // Calculate total from direct items and subcategories
      let subcategoryTotal = 0;

      // Apply the same process to each subcategory and calculate totals
      Object.values(mainCategory.subcategoriesByCuisine).forEach(
        (subcategories) => {
          subcategories.forEach((subcategory) => {
            // Get all item type categories used in this subcategory
            const usedSubItemTypes = Object.keys(subcategory.count);
            const usedSubItemTypeIds = itemTypes
              .filter((type) => usedSubItemTypes.includes(type.name))
              .map((type) => type._id.toString());

            // Find all item type categories
            const subItemTypeCategories = new Set();
            for (const typeId of usedSubItemTypeIds) {
              const itemType = itemTypeMap.get(typeId);
              if (itemType && itemType.category) {
                subItemTypeCategories.add(itemType.category.toString());
              }
            }

            // Add all related item types with the same category
            for (const typeCategoryId of subItemTypeCategories) {
              const relatedTypes =
                itemTypesByCategoryMap.get(typeCategoryId) || [];
              for (const relatedType of relatedTypes) {
                if (!subcategory.count.hasOwnProperty(relatedType.name)) {
                  subcategory.count[relatedType.name] = 0;
                }
              }
            }

            // Add subcategory total to accumulated total
            subcategoryTotal += subcategory.total;
          });
        }
      );

      // Set the main category total to the sum of direct items and subcategory totals
      mainCategory.total = mainCategory.directTotal + subcategoryTotal;

      // Remove the temporary tracking property
      delete mainCategory.directTotal;
    }

    // Reset all count values to 0 before sending the response
    if (resetData) {
      for (const mainCategory of mainCategoriesMap.values()) {
        // Reset main category total
        mainCategory.total = 0;

        // Reset main category item type counts
        for (const itemType in mainCategory.count) {
          mainCategory.count[itemType] = 0;
        }

        // Reset subcategory counts
        Object.values(mainCategory.subcategoriesByCuisine).forEach(
          (subcategories) => {
            subcategories.forEach((subcategory) => {
              // Reset subcategory total
              subcategory.total = 0;

              // Reset subcategory item type counts
              for (const itemType in subcategory.count) {
                subcategory.count[itemType] = 0;
              }
            });
          }
        );
      }
    }

    // Convert map to array for response
    const result = Array.from(mainCategoriesMap.values());

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in countData:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.searchCategoriesSimplified = async (req, res) => {
  try {
    // Extract search text and vegOnly from request
    const vegOnly = req.body.vegOnly || false;
    const searchText = req.body.searchText || "";
    if (!searchText.trim()) {
      return res.status(400).json({ message: "Search text is required" });
    }

    // Create case-insensitive search regex
    const searchRegex = new RegExp(searchText, "i");

    // Get all categories for reference
    const categories = await Category.find().lean();

    // Create category maps for quick lookup
    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat])
    );

    // Find matching items along with their categories and parent categories
    const matchingItems = await MasterMenu.aggregate([
      // Match items with text matching search criteria
      {
        $match: {
          isAvailable: true,
          ...(vegOnly && {
            itemTypes: {
              $nin: [
                new mongoose.Types.ObjectId("67aecd22d3af1523c01ee922"),
                new mongoose.Types.ObjectId("67f760ba1dd04569e7bbe2fd"),
              ],
            },
          }),
          $or: [{ name: searchRegex }, { description: searchRegex }],
        },
      },

      // Lookup related categories
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      // Unwind categoryData to process each category
      { $unwind: "$categoryData" },

      // Lookup parent categories for subcategories
      {
        $lookup: {
          from: "categories",
          localField: "categoryData.parentCategories",
          foreignField: "_id",
          as: "parentCategoryData",
        },
      },

      // Project fields we need
      {
        $project: {
          _id: 1,
          name: 1,
          description: { $ifNull: ["$description", ""] },
          categoryData: {
            _id: "$categoryData._id",
            name: "$categoryData.name",
            parentCategories: "$categoryData.parentCategories",
          },
          parentCategoryData: {
            $map: {
              input: "$parentCategoryData",
              as: "parent",
              in: {
                _id: "$$parent._id",
                name: "$$parent.name",
              },
            },
          },
        },
      },
    ]);

    // Initialize result array for flattened items
    const result = [];

    // Process matching items to create flattened structure
    matchingItems.forEach((item) => {
      const category = item.categoryData;
      const categoryId = category._id.toString();
      const isSubcategory =
        category.parentCategories && category.parentCategories.length > 0;

      // Determine category type and names
      const type = isSubcategory ? "subcategory" : "category";
      const subcategoryName = isSubcategory ? category.name : null;
      let categoryName = isSubcategory
        ? item.parentCategoryData[0]?.name ||
          categoryMap.get(category.parentCategories[0]?.toString())?.name
        : category.name;

      // Fallback if parent category name is not found
      if (!categoryName) {
        categoryName = category.name; // Use category name if no parent found
      }

      // Add item to result
      result.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        type,
        subcategoryName,
        categoryName,
      });
    });

    // Add items from categories directly matching the search term
    const directCategoryItems = await MasterMenu.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $match: {
          isAvailable: true,
          ...(vegOnly && {
            itemTypes: {
              $nin: [
                new mongoose.Types.ObjectId("67aecd22d3af1523c01ee922"),
                new mongoose.Types.ObjectId("67f760ba1dd04569e7bbe2fd"),
              ],
            },
          }),
          "categoryData.name": searchRegex,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryData.parentCategories",
          foreignField: "_id",
          as: "parentCategoryData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: { $ifNull: ["$description", ""] },
          categoryData: {
            _id: "$categoryData._id",
            name: "$categoryData.name",
            parentCategories: "$categoryData.parentCategories",
          },
          parentCategoryData: {
            $map: {
              input: "$parentCategoryData",
              as: "parent",
              in: {
                _id: "$$parent._id",
                name: "$$parent.name",
              },
            },
          },
        },
      },
    ]);

    directCategoryItems.forEach((item) => {
      const category = item.categoryData;
      const categoryId = category._id.toString();
      const isSubcategory =
        category.parentCategories && category.parentCategories.length > 0;

      const type = isSubcategory ? "subcategory" : "category";
      const subcategoryName = isSubcategory ? category.name : null;
      let categoryName = isSubcategory
        ? item.parentCategoryData[0]?.name ||
          categoryMap.get(category.parentCategories[0]?.toString())?.name
        : category.name;

      if (!categoryName) {
        categoryName = category.name;
      }

      result.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        type,
        subcategoryName,
        categoryName,
      });
    });

    // Remove duplicates by _id
    const uniqueResults = Array.from(
      new Map(result.map((item) => [item._id.toString(), item])).values()
    );

    res.status(200).json(uniqueResults);
  } catch (error) {
    console.error("Error in searchCategoriesSimplified:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.processVariantMenuCounts = async (req, res) => {
  try {
    const { vegOnly = false, cuisineIds = [] } = req.body;
    const variants = await Variant.find();
    if (!Array.isArray(variants) || variants.length === 0) {
      return res
        .status(400)
        .json({ message: "No variants provided or invalid format" });
    }

    // Create a copy of variants to return with counts
    const processedVariants = [];
    const updatePromises = [];

    // Process each variant
    for (const variant of variants) {
      // Make sure we have the variant ID
      if (!variant._id) {
        console.error("Missing variant ID, skipping update");
        continue;
      }

      // Skip variants with no menu items
      if (
        !variant.menuItems ||
        !Array.isArray(variant.menuItems) ||
        variant.menuItems.length === 0
      ) {
        const variantWithEmptyCount = {
          ...variant,
          availableMenuCount: [],
        };

        processedVariants.push(variantWithEmptyCount);

        // Update variant in database with empty count
        updatePromises.push(
          Variant.findByIdAndUpdate(
            variant._id,
            { $set: { availableMenuCount: [] } },
            { new: true }
          )
        );

        continue;
      }

      // Create a mock request for countDataByIds
      const mockReq = {
        body: {
          itemIds: variant.menuItems,
          vegOnly: vegOnly,
          resetData: false,
          // cuisineIds: cuisineIds
        },
      };

      // Create a mock response to capture the result
      const mockRes = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.data = data;
          return this;
        },
      };

      // Call the existing countDataByIds function
      await countDataByIds(mockReq, mockRes);

      // Check if the call was successful
      if (mockRes.statusCode === 200) {
        // Store the result in the variant
        const updatedVariant = {
          ...variant,
          availableMenuCount: mockRes.data,
        };

        processedVariants.push(updatedVariant);

        // Update variant in database
        updatePromises.push(
          Variant.findByIdAndUpdate(
            variant._id,
            { $set: { availableMenuCount: mockRes.data } },
            { new: true }
          )
        );
      } else {
        // Handle error case
        console.error(`Error processing variant ${variant._id}:`, mockRes.data);
        const errorVariant = {
          ...variant,
          availableMenuCount: [],
          error: mockRes.data.message || "Error processing variant",
        };

        processedVariants.push(errorVariant);

        // Update variant in database with empty count and error info
        updatePromises.push(
          Variant.findByIdAndUpdate(
            variant._id,
            {
              $set: {
                availableMenuCount: [],
                processingError:
                  mockRes.data.message || "Error processing variant",
              },
            },
            { new: true }
          )
        );
      }
    }

    // Wait for all database updates to complete
    await Promise.all(updatePromises);
    res.status(200).json(processedVariants);
  } catch (error) {
    console.error("Error in processVariantMenuCounts:", error);
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.countDataByIds = countDataByIds;
