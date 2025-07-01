const express = require("express");
const router = express.Router();
const masterMenuController = require("../controllers/masterMenu.controller");
const { authMiddleware } = require("../../../middleware/authMiddleware");

// Create a new menu item
router.post("/", authMiddleware, masterMenuController.create);

// Get all menu items
router.get("/", masterMenuController.findAll);

router.get("/misc", masterMenuController.findAllWithMiscellaneous);

// Get a single menu item by ID
router.get("/:id", authMiddleware, masterMenuController.findOne);

// Update a menu item
router.put("/:id", authMiddleware, masterMenuController.update);

// Delete a menu item
router.delete("/:id", authMiddleware, masterMenuController.delete);

// Import bulk menu items
router.post("/import-bulk", masterMenuController.importBulk);
router.post("/countData", masterMenuController.countData);
router.post("/countByIds", masterMenuController.countDataByIds);
router.post("/updateCounts", masterMenuController.processVariantMenuCounts);
router.post("/search", masterMenuController.searchCategoriesSimplified);
module.exports = router;
