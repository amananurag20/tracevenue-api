const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Create a notification
router.post("/", notificationController.createNotification);

// Get all notifications
router.get("/", notificationController.getNotifications);

// Get a specific notification by ID
router.get("/:id", notificationController.getNotificationById);

// Update a notification by ID
router.put("/update/:id", notificationController.updateNotification);

// Delete a notification by ID
router.delete("/:id", notificationController.deleteNotification);

// Mark notification as seen
router.put("/seen", notificationController.markAsSeen);

module.exports = router;
