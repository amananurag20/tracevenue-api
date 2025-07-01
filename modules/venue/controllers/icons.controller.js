const {
    createIcons,
    getIcons,
  } = require("../services/icons.service");
  

  const createIconsController = async (req, res, next) => {
    try {
      const newIcon = await createIcons(req.body);
      return res.status(201).json({
        message: "Icon Added successfully",
        newIcon: newIcon,
      });
    } catch (err) {
      return res.status(500).json({
        messge: err.message,
      });
    }
  };

  const getIconsController = async (req, res, next) => {
    try {
      const eventData = await getIcons();
      return res.status(200).json(eventData);
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  };

  module.exports = {
    createIconsController,
    getIconsController,
  };
  