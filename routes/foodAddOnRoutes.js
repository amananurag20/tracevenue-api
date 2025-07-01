const express = require("express");
const router = express.Router();

const {
  createFoodItemsAddOn,
  getAllFoodItemsAddOn,
  updateFoodItemsAddOn,
  deleteFoodItemsAddOn,
  getFoodItemsAddOnById,
} = require("../controllers/foodItemsAddOn");
const { authMiddleware } = require("../middleware/authMiddleware");
router.use(authMiddleware);
router.post("/", createFoodItemsAddOn);
router.get("/", getAllFoodItemsAddOn);
router.get("/:id", getFoodItemsAddOnById);
router.put("/:id", updateFoodItemsAddOn);
router.delete("/:id", deleteFoodItemsAddOn);
module.exports = router;
