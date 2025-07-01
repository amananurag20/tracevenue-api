const express = require("express");
const router = express.Router();

const {
  createFoodItems,
  getAllFoodItems,
  updateFoodItems,
  deleteFoodItems,
  getFoodItemsById,
  getFoodItemsByRestaurantId,
  applyTaxOnFoodItems,
} = require("../controllers/foodItemsController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", authMiddleware, createFoodItems);
router.get("/", getAllFoodItems);
router.get("/res", getFoodItemsByRestaurantId);
router.get("/:id", getFoodItemsById);
router.put("/:id", authMiddleware, updateFoodItems);
router.delete("/:id", authMiddleware, deleteFoodItems);
router.patch("/tax-applied/:id", authMiddleware, applyTaxOnFoodItems);

module.exports = router;
