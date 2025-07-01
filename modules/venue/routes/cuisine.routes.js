const express = require("express");
const router = express.Router();
const cuisineController = require("../controllers/cuisine.controller");
const { authMiddleware } = require("../../../middleware/authMiddleware");

// Create a new cuisine
router.post("/", authMiddleware, cuisineController.create);

// Get all cuisines
router.get("/", cuisineController.findAll);
router.post("/by-event", cuisineController.findCuisines);

// Get a single cuisine by ID
router.get("/:id", authMiddleware, cuisineController.findOne);

// Update a cuisine
router.put("/:id", authMiddleware, cuisineController.update);

// Delete a cuisine
router.delete("/:id", authMiddleware, cuisineController.delete);

module.exports = router;
