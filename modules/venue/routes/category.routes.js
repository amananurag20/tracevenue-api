const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authMiddleware } = require("../../../middleware/authMiddleware");
// Create a new category
router.post("/", authMiddleware, categoryController.create);

// Get all categories
router.get("/", categoryController.findAll);

// Get main categories (no parent)
router.get("/main", authMiddleware, categoryController.findMainCategories);

// Get subcategories of a specific category
router.get(
  "/:id/subcategories",
  authMiddleware,
  categoryController.findSubcategories
);

// Get a single category by ID
router.get("/:id", authMiddleware, categoryController.findOne);

// Update a category
router.put("/:id", authMiddleware, categoryController.update);

// Delete a category
router.delete("/:id", authMiddleware, categoryController.delete);

module.exports = router;
