const ServiceCategory = require("../models/serviceCategory.model");

const createServiceCategory = async (data) => {
  return await ServiceCategory.create(data);
};

// get event:
const getServiceCategory = async () => {
  return await ServiceCategory.find();
};

module.exports = {
    createServiceCategory,
    getServiceCategory,
};
