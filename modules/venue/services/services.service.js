const { sanitizeDataHelper } = require("../helpers/sanitizedData.helper");
const Service = require("../models/services.model");

const { SERVICE_FIELDS } = require("../constants");
const getServices = async () => {
  return await Service.find();
};
const getServicesById = async (id) => {
  return await Service.findById(id);
};
const createService = async (serviceData) => {
  const sanitizedData = sanitizeDataHelper(serviceData, SERVICE_FIELDS);
  return await Service.create(sanitizedData);
};
const deleteService = async (id) => {
  return await Service.findByIdAndDelete(id);
};
const updateService = async (id, updateData) => {
  const sanitizedData = sanitizeDataHelper(updateData, SERVICE_FIELDS);
  return await Service.findByIdAndUpdate(id, sanitizedData, { new: true });
};

// get all unarchived services at restaurant side:
const getServicesToVendors = async () => {
  return await Service.find({ archive: false });
};

module.exports = {
  getServices,
  createService,
  deleteService,
  updateService,
  getServicesById,
  getServicesToVendors,
};
