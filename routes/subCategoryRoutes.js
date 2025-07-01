const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.use(authMiddleware);
router.post("/", subCategoryController.createSubCategory);
router.get("/", subCategoryController.getSubCategories);
router.get("/:id", subCategoryController.getSubCategoryById);
router.put("/:id", subCategoryController.updateSubCategory);
router.delete("/:id", subCategoryController.deleteSubCategory);

module.exports = router;
