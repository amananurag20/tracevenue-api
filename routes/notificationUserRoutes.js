const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", notificationController.createNotificationUser);
router.get("/", notificationController.getAllNotificationUser);
router.use(authMiddleware);
router.post("/all", notificationController.sendToAll);
router.post("/send", notificationController.sendToSelected);

module.exports = router;
