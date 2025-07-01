const RestaurantMenu = require("../models/restaurantMenu.model");
const Items = require("../models/masterMenu.model");
const Category = require("../models/categories.model");
const MasterMenu = require("../models/masterMenu.model");
const { menuCategoriesDetailsUpdate } = require("../../../events/communication");
let rootId;

// create service:
const createRestaurantMenu = async (data) => {
  const restaurantMenu = new RestaurantMenu({
    restaurantId: data.restaurantId,
    items: data.items, // An array of MasterMenu item IDs
  });
  await restaurantMenu.save();
  const populatedRestaurantMenu = await RestaurantMenu.findById(
    restaurantMenu._id
  ).populate({
    path: "items",
    model: Items,
  });
  return populatedRestaurantMenu;
};

// get service:

const getRestaurantMenu = async () => {
  const packageCategories = await RestaurantMenu.find().populate({
    path: "items",
    model: Items,
  });
  return packageCategories;
};

const getRestaurantById = async (id) => {
  const menu = await RestaurantMenu.findOne({ restaurantId: id }).populate({
    path: "items",
    model: Items,
  });
  return menu;
};

const updateMenuItems = async (menuId, data) => {
  const updatedMenu = await RestaurantMenu.findOneAndUpdate(
    { restaurantId: menuId },
    { items: data.items }, // Update only the items array
    { new: true }
  ).populate({
    path: "items",
    model: Items,
  });
  return updatedMenu;
};

const updateRestaurantById = async (restaurantId, data) => {
  try {
    const {
      id,
      type = {},
      action,
      items,
    } = data || {};

    let updateQuery = {};

    if (type) {
      // First, get the restaurant menu with populated items to work with existing data
      const restaurantMenu = await RestaurantMenu.findOne({ restaurantId })
        .populate({
          path: "items",
          select: "category _id",
          options: { lean: true }
        })
        .lean();

      if (!restaurantMenu) {
        throw new Error("Restaurant menu not found");
      }

      if (type === "category") {
        if (action === "remove") {
          // Get subcategories efficiently
          const subcategories = await Category.find({
            parentCategories: id,
          }).select("_id").lean();
          const subcategoryIds = subcategories.map(sub => sub._id.toString());

          // Filter items from restaurant's existing menu instead of querying MasterMenu
          const categoryId = id.toString();
          const itemsToDisable = restaurantMenu.items
            .filter(item => {
              const itemCategoryId = item.category.toString();
              return itemCategoryId === categoryId || subcategoryIds.includes(itemCategoryId);
            })
            .map(item => item._id);

          updateQuery = {
            $addToSet: {
              disabledCategories: id,
              ...(subcategoryIds.length > 0 && { disabledSubCategories: { $each: subcategoryIds } }),
              ...(itemsToDisable.length > 0 && { disabledItems: { $each: itemsToDisable } }),
            },
          };
        } else {
          // Enable category
          const subcategories = await Category.find({
            parentCategories: id,
          }).select("_id").lean();
          const subcategoryIds = subcategories.map(sub => sub._id);

          const categoryId = id.toString();
          const itemsToEnable = restaurantMenu.items
            .filter(item => {
              const itemCategoryId = item.category.toString();
              return itemCategoryId === categoryId || subcategoryIds.some(subId => subId.toString() === itemCategoryId);
            })
            .map(item => item._id);

          updateQuery = {
            $pull: {
              disabledCategories: id,
              ...(subcategoryIds.length > 0 && { disabledSubCategories: { $in: subcategoryIds } }),
              ...(itemsToEnable.length > 0 && { disabledItems: { $in: itemsToEnable } }),
            },
          };
        }
      } else if (type === "subcategory") {
        // Filter items from restaurant's existing menu
        const itemsInSubcategory = restaurantMenu.items
          .filter(item => item.category.toString() === id.toString())
          .map(item => item._id);

        if (action === "remove") {
          updateQuery = {
            $addToSet: {
              disabledSubCategories: id,
              ...(itemsInSubcategory.length > 0 && { disabledItems: { $each: itemsInSubcategory } }),
            },
          };
        } else {
          updateQuery = {
            $pull: {
              disabledSubCategories: id,
              ...(itemsInSubcategory.length > 0 && { disabledItems: { $in: itemsInSubcategory } }),
            },
          };
        }
      } else if (type === "items") {
        updateQuery =
          action === "remove"
            ? { $addToSet: { disabledItems: id } }
            : { $pull: { disabledItems: id } };
      } else {
        throw new Error("Invalid type");
      }
    }

    if (items) {
      updateQuery = {
        $addToSet: {
          items: items,
        },
      };
    }

    // Update the RestaurantMenu
    const updatedRestaurant = await RestaurantMenu.findOneAndUpdate(
      { restaurantId },
      updateQuery,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate({
      path: "items",
      model: Items,
      options: { lean: true }
    });

    return updatedRestaurant;
  } catch (error) {
    console.error("Error updating restaurant menu:", error);
    return null;
  }
};

module.exports = {
  getRestaurantById,
  createRestaurantMenu,
  getRestaurantMenu,
  updateRestaurantById,
  updateMenuItems
};
