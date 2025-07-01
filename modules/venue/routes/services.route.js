const express = require("express");
const { sanitizeData } = require("../middleware/sanitize.middleware");
const {
  getServicesController,
  getServicesByIdController,
  createServiceController,
  deleteServiceController,
  updateServiceController,
} = require("../controllers/services.controller");

const router = express.Router();

router.get("/", getServicesController);
router.get("/:id", getServicesByIdController);
router.post("/", sanitizeData, createServiceController);
router.delete("/:id", deleteServiceController);
router.put("/:id", sanitizeData, updateServiceController);

module.exports = router;
