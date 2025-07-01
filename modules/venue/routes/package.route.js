const express = require("express");
const {
  createPackageController,
  getPackageController,
  getPackageByIdController,
  updatePackageController,
  deletePackageController,
  getPackageBySearchController,
  fetchPackageVariants,
} = require("../controllers/package.controller");

const { sanitizeData } = require("../middleware/sanitize.middleware");
const router = express.Router();

// crud operations for package:
router.get("/search", getPackageBySearchController);
router.post("/", sanitizeData, createPackageController);
router.get("/", getPackageController);
router.get("/package-variants", fetchPackageVariants);
router.get("/:id", getPackageByIdController);
router.put("/:id", sanitizeData, updatePackageController);
router.delete("/:id", deletePackageController);

module.exports = router;
