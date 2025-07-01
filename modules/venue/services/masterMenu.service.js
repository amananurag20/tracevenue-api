const MasterMenu = require("../models/masterMenu.model");

// create service:
const createMasterMenu = async ({
  itemName,
  itemType,
  categories,
  subcategories,
  cuisineType,
}) => {
  return await MasterMenu.create({
    itemName,
    itemType,
    categories,
    subcategories,
    cuisineType,
  });
};
// get service:
const getMasterMenu = async () => {
  return await MasterMenu.find()
    .populate("itemType")
    .populate("categories")
    .populate("subcategories")
    .populate("cuisineType");
};

// get by id service:
const getMasterMenuByID = async (id) => {
  return await MasterMenu.findById(id)
    .populate("itemType")
    .populate("categories")
    .populate("subcategories")
    .populate("cuisineType");
};

// update service:
const updateMasterMenu = async (id, data) => {
  return await MasterMenu.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("itemType")
    .populate("categories")
    .populate("subcategories")
    .populate("cuisineType");
};

// delete master menu:
const deleteMasterMenu = async (id) => {
  return await MasterMenu.findByIdAndDelete(id);
};

module.exports = {
  createMasterMenu,
  getMasterMenu,
  updateMasterMenu,
  deleteMasterMenu,
  getMasterMenuByID,
};
