const {
    createServiceCategory,
    getServiceCategory,
  } = require("../services/serviceCategory.service");
  

  const createServiceCategoryController = async (req, res, next) => {
    try {
      const newIcon = await createServiceCategory(req.body);
      return res.status(201).json({
        message: "serviceCategory Added successfully",
        newIcon: newIcon,
      });
    } catch (err) {
      return res.status(500).json({
        messge: err.message,
      });
    }
  };

  const getServiceCategoryController = async (req, res, next) => {
    try {
      const eventData = await getServiceCategory();
      return res.status(200).json(eventData);
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  };

  module.exports = {
    createServiceCategoryController,
    getServiceCategoryController,
  };
  