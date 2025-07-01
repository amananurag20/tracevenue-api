const Restaurant = require("../../../models/RestaurantModels");
const {
  updateVariantsBasedOnDisabledItems,
} = require("../helpers/restaurantMenu.helper");
const {
  createRestaurantMenu,
  getRestaurantMenu,
  getRestaurantById,
  updateRestaurantById,
  updateMenuItems,
} = require("../services/restaurantMenu.service");

// create masterMenu controller:
const createRestaurantController = async (req, res, next) => {
  try {
    const data = await createRestaurantMenu(req.body);
    return res.status(201).json({
      data: data,
      message: "Items Added successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// get master menu controller:
const getRestaurantController = async (req, res, next) => {
  try {
    const data = await getRestaurantMenu();
    return res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getRestaurantByIdController = async (req, res, next) => {
  try {
    //   get by id service:
    const restaurantMenu = await getRestaurantById(req.params.id);
    if (!restaurantMenu) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }
    await res.status(200).json(restaurantMenu);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// const updateRestaurantByIdController = async (req, res, next) => {
//   try {
//     //   get by id service:
//     console.log("controller");
//     const restaurantMenu = await updateRestaurantById(req.params.id, req.body);
//     if (!restaurantMenu) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     await res.status(200).json(restaurantMenu);
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };

const updateRestaurantByIdController = async (req, res, next) => {
  try {
    const restaurantMenu = await getRestaurantById(req.params.id);
    if (!restaurantMenu) {
      const createdData = await createRestaurantMenu({
        restaurantId: req.params.id,
        items: req.body.items,
      });

      return res.status(201).json({
        data: createdData,
        message: "Restaurant not found, so a new one was created",
      });
    }

    const { disabledCategories, disabledSubCategories, disabledItems } =
      restaurantMenu;
    let updatedData = await updateRestaurantById(req.params.id, req.body);

    const {
      disabledCategories: updatedDisabledCategories,
      disabledSubCategories: updatedDisabledSubCategories,
      disabledItems: updatedDisabledItems,
    } = updatedData;

    // Deep compare the arrays or objects if necessary
    const categoriesChanged =
      JSON.stringify(disabledCategories) !==
      JSON.stringify(updatedDisabledCategories);
    const subCategoriesChanged =
      JSON.stringify(disabledSubCategories) !==
      JSON.stringify(updatedDisabledSubCategories);
    const itemsChanged =
      JSON.stringify(disabledItems) !== JSON.stringify(updatedDisabledItems);

    // Trigger update of variants only if there are changes in the disabled items
    if (categoriesChanged || subCategoriesChanged || itemsChanged) {
      await updateVariantsBasedOnDisabledItems(req.params.id);
    }

    return res.status(200).json({
      data: updatedData,
      message: "Restaurant updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const updateRestaurantMenuByIdController = async (req, res, next) => {
  try {
    //   get by id service:
    const restaurantMenu = await updateMenuItems(req.params.id, req.body);
    if (!restaurantMenu) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }
    await res.status(200).json(restaurantMenu);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getRestaurantByIdForChat = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }
    await res.status(200).json(restaurant);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getRestaurantByIdController,
  createRestaurantController,
  getRestaurantController,
  updateRestaurantByIdController,
  getRestaurantByIdForChat,
  updateRestaurantMenuByIdController,
};
