const Icons = require("../models/icons.model");

const createIcons = async (data) => {
  return await Icons.create(data);
};

// get event:
const getIcons = async () => {
  return await Icons.find();
};

module.exports = {
  createIcons,
  getIcons,
};
