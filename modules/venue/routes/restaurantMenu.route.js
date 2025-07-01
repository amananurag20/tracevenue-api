const {
  createRestaurantController,
  getRestaurantController,
  getRestaurantByIdController,
  updateRestaurantByIdController,
  getRestaurantByIdForChat,
  updateRestaurantMenuByIdController,
} = require("../controllers/restaurantMenu.controller");
const express = require("express");

const router = express.Router();

router.get("/chat/:id", getRestaurantByIdForChat);
router.post("/", createRestaurantController);
router.get("/", getRestaurantController);
router.get("/:id", getRestaurantByIdController);
router.put("/:id", updateRestaurantByIdController);
router.put("/menuItems/:id", updateRestaurantMenuByIdController);

module.exports = router;
