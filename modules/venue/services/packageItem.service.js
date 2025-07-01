const { PACKAGE_ITEMS_FIELDS } = require("../constants/index");
const { sanitizeDataHelper } = require("../helpers/sanitizedData.helper");
const PackageItems = require("../models/packageItems.model");

// create service:
const createPackageItem = async (data) => {
  const sanitizedData = sanitizeDataHelper(data, PACKAGE_ITEMS_FIELDS);
  return await PackageItems.create(sanitizedData);
  // for dummy data:
  // return await PackageItems.insertMany(data);
};

// get service:
const getPackageItem = async () => {
  return await PackageItems.find();
};

// getById service:
const getPackageItemById = async (id) => {
  return await PackageItems.findById(id);
};

// update service:
const updatePackageItem = async (id, updateData) => {
  const sanitizedData = sanitizeDataHelper(updateData, PACKAGE_ITEMS_FIELDS);
  return await PackageItems.findByIdAndUpdate(id, sanitizedData, { new: true });
};

const deletePackageItem = async (id) => {
  return PackageItems.findByIdAndDelete(id);
};

module.exports = {
  createPackageItem,
  getPackageItem,
  getPackageItemById,
  updatePackageItem,
  deletePackageItem,
};
