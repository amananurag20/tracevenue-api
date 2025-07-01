// chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { sanitizeData } = require("../middleware/sanitize.middleware");

// CREATE
router.post("/", sanitizeData, chatController.createChat);

// READ
router.post("/between", sanitizeData, chatController.getChatsBetweenUsers);
router.get("/unread/:userId", sanitizeData, chatController.getUnreadMessages);
router.get("/:id", sanitizeData, chatController.getChatById);

// UPDATE
router.put("/read/:id", sanitizeData, chatController.markAsRead);
router.put("/:id", sanitizeData, chatController.updateChatMessage);
router.put(
  "/mark-all-read/:receiverId",
  sanitizeData,
  chatController.markAllAsRead
);

// DELETE
router.delete("/:id", sanitizeData, chatController.deleteChat);
router.delete("/between", sanitizeData, chatController.deleteChatsBetweenUsers);

module.exports = router;
