const express = require("express");
const router = express.Router();
const {
  createFoodCategory,
  getFoodCategory,
  updateFoodCategoryFields,
  updateFoodCategory,
  deleteFoodCategory,
  getFoodCategoryById,
  getFoodCategoriesByRestaurantId,
} = require("../controllers/foodCategoryController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", authMiddleware, createFoodCategory);
router.get("/", getFoodCategory);
router.get("/res/:restaurantId", getFoodCategoriesByRestaurantId);
router.put("/:id", authMiddleware, updateFoodCategory);
router.patch("/:id", authMiddleware, updateFoodCategoryFields);
router.get("/:id", authMiddleware, getFoodCategoryById);
router.delete("/:id", authMiddleware, deleteFoodCategory);

module.exports = router;
