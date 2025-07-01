const express = require("express");
const {
  createVariantController,
  getVariantsByPackageController,
  getVariantByIdController,
  UpdateVariantController,
  deleteVariantController,
  createBulkVariantsController,
  filterVariantsController,
  newFilteredVariantsController,
  variantByIds,
} = require("../controllers/variant.controller");

const { sanitizeData } = require("../middleware/sanitize.middleware");
const router = express.Router();

//  filter variants on basis of location, event type, peoples and cuisine
router.post("/filteredVariants", filterVariantsController);
router.post("/variant-by-ids", variantByIds);
router.post("/newFilteredVariants", newFilteredVariantsController);

// crud operations for variant:
router.post("/", sanitizeData, createVariantController);
router.get("/", getVariantsByPackageController);
router.get("/:id", getVariantByIdController);
router.put("/:id", sanitizeData, UpdateVariantController);
router.delete("/:id", deleteVariantController);
router.post("/bulk", createBulkVariantsController);

module.exports = router;
