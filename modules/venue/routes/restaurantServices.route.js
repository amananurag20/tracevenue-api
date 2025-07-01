const express = require("express");
const router = express.Router();
const {
  getServicesToVendorController,
} = require("../controllers/services.controller");
const { sanitizeData } = require("../middleware/sanitize.middleware");
const {
  createRestaurantServiceController,
  getRestaurantServicesController,
  getRestaurantServicesByRestaurantIdController,
  deleteRestaurantServiceController,
  updateRestaurantServiceController,
} = require("../controllers/restaurantServices.controller");

// getting data from superadmin db:
router.get("/services", getServicesToVendorController);

// crud operation for services at vendor side:

router.get("/", getRestaurantServicesController);
router.get("/:id", getRestaurantServicesByRestaurantIdController);
router.post("/", sanitizeData, createRestaurantServiceController);
router.delete("/:id", deleteRestaurantServiceController);
router.put("/:id", sanitizeData, updateRestaurantServiceController);

module.exports = router;
