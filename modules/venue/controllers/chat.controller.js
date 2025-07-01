// chatController.js
const { default: mongoose } = require("mongoose");
const Chat = require("../models/chat.model");
const {
  newMessageUpdate,
  chatNotification,
} = require("../../../events/communication");
const { text } = require("body-parser");
const Notification = require("../../notification/models/notification");
const Restaurant = require("../../../models/RestaurantModels");
const User = require("../../../models/User");

// CREATE - Create a new chat message
exports.createChat = async (req, res) => {
  try {
    const { senderId, receiverId, message, jobId, sender } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: senderId, receiverId, and message are required",
      });
    }

    const newChat = new Chat({
      senderId,
      receiverId,
      message,
      jobId: jobId || null,
      read: false,
      sender,
    });

    // Get sender details based on sender type
    let senderDetails = null;
    if (sender === "user") {
      senderDetails = await User.findById(senderId)
        .select("userName profileImage email")
        .lean();
    } else if (sender === "restaurant") {
      senderDetails = await Restaurant.findById(senderId)
        .select("userName profileImage email")
        .lean();
    }

    const chatNotificationData = {
      message: message,
      sender: sender,
    };

    await Notification.create({
      from_id: senderId,
      to_ids: [receiverId],
      notification_title: `A new message from ${senderDetails?.userName || "someone"}`,
      notification_message: `You have received a new message from ${senderDetails?.userName || "someone"}.`,
      action_link: "/chat-notifications",
      metadata: {
        jobId: jobId,
        chatId: newChat._id,
        sender: sender,
        receiverId: receiverId,
        senderId: senderId,
        senderDetails: senderDetails || null,
        message: message,
      },
      priority: "medium",
    });

    chatNotification(senderId, receiverId, jobId, chatNotificationData);
    const savedChat = await newChat.save();
    newMessageUpdate(savedChat);

    res.status(201).json({
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating chat message",
      error: error.message,
    });
  }
};


// READ - Get chat messages for multiple users
exports.getChatsBetweenUsers = async (req, res) => {
  try {
    let { userIds, jobId } = req.body;

    // Validate userIds: Should be a non-empty array of valid ObjectIds
    if (
      !Array.isArray(userIds) ||
      userIds.length === 0 ||
      !userIds.every((id) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array of valid ObjectIds",
      });
    }

    // Query to find messages where any of the provided users are involved
    let query = {
      $and: [{ senderId: { $in: userIds } }, { receiverId: { $in: userIds } }],
    };

    // Add jobId filter if provided
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      query.jobId = jobId;
    }

    const chats = await Chat.find(query).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving chat messages",
      error: error.message,
    });
  }
};
// READ - Get a single chat message by ID
exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId)
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving chat message",
      error: error.message,
    });
  }
};

// READ - Get all unread messages for a user
exports.getUnreadMessages = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const unreadMessages = await Chat.find({
      receiverId: userId,
      read: false,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name email");

    res.status(200).json({
      success: true,
      count: unreadMessages.length,
      data: unreadMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving unread messages",
      error: error.message,
    });
  }
};

// UPDATE - Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const chatId = req.params.id;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { read: true },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking message as read",
      error: error.message,
    });
  }
};
exports.markAllAsRead = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { senderId, jobId } = req.query; // Optional filters

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Build the query
    const query = { receiverId, read: false };

    // Add optional filters if provided
    if (senderId) query.senderId = senderId;
    if (jobId) query.jobId = jobId;

    // Update all matching messages
    const result = await Chat.updateMany(query, { read: true });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};
// UPDATE - Update a chat message content
exports.updateChatMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { message },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating message",
      error: error.message,
    });
  }
};

// DELETE - Delete a chat message
exports.deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting chat message",
      error: error.message,
    });
  }
};

// DELETE - Delete all chats between two users
exports.deleteChatsBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2, jobId } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required",
      });
    }

    const query = {
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    };

    // Add jobId filter if provided
    if (jobId) {
      query.jobId = jobId;
    }

    const result = await Chat.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} chat messages deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting chat messages",
      error: error.message,
    });
  }
};
