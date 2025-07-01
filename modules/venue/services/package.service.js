const { PACKAGE_FIELDS } = require("../constants/index");
const { sanitizeDataHelper } = require("../helpers/sanitizedData.helper");
const Package = require("../models/package.model");

// package create service:
const createPackage = async (packageData) => {
  // const sanitizedData = sanitizeDataHelper(packageData, PACKAGE_FIELDS);
  // return await Package.create(sanitizedData);
  // for raw data:
  return await Package.insertMany(packageData);
};

// isPackageExist:
const isPackageExist = async (venueId, packageName) => {
  return await Package.findOne({
    venueId: venueId,
    name: packageName,
  });
};

// get packages services:
const getPackage = async ({ venueId }) => {
  return await Package.find({ venueId });
};

// get package by id service:
const getPackageById = async (id) => {
  return await Package.findById(id).populate("eventType");
};

// delete package:
const deletePackage = async (id) => {
  return await Package.findByIdAndDelete(id);
};

// update package:
const updatePackage = async (id, updateData) => {
  const sanitizedData = sanitizeDataHelper(updateData, PACKAGE_FIELDS);
  return await Package.findByIdAndUpdate(id, sanitizedData, { new: true });
};

// get package by search:
const getPackageBySearch = async (filter) => {
  return await Package.find(filter);
};

module.exports = {
  createPackage,
  isPackageExist,
  getPackage,
  getPackageById,
  updatePackage,
  deletePackage,
  getPackageBySearch,
};
