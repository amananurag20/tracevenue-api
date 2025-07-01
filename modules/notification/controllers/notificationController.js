const { default: mongoose, Types } = require("mongoose");
const jobsModel = require("../../venue/models/jobs.model");
const Notification = require("../models/notification");
const User = require("../../../models/User");
const Restaurant = require("../../../models/RestaurantModels");
// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const {
      from_id,
      to_ids,
      notification_title,
      notification_message,
      action_link,
      metadata,
      priority,
    } = req.body;

    const newNotification = new Notification({
      from_id,
      to_ids,
      notification_title,
      notification_message,
      action_link,
      metadata,
      priority,
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification" });
  }
};

// Get all notifications
// exports.getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching notifications" });
//   }
// };

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    const populatedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        const notificationObj = notif.toObject(); // convert Mongoose doc to plain object

        if (notif.metadata?.jobId) {
          const job = await jobsModel.findById(notif.metadata.jobId).lean();
          if (job) {
            notificationObj.metadata.job = job;
          }
        }

        return notificationObj;
      })
    );
    res.status(200).json(populatedNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Get a specific notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notifications = await Notification.find({
      to_ids: { $in: [id] },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const jobId = notification.metadata?.jobId;
        if (jobId && Types.ObjectId.isValid(jobId)) {
          const jobObjectId = new Types.ObjectId(jobId);
          const job = await jobsModel
            .findById(jobObjectId)
            .select("name specialRequirements budget eventType peopleRange budgetType userId")
            .populate({ path: "eventType", select: "eventName" })
            .lean();

          if (job) {
            notification.metadata.jobDetails = job;
          }
        }
        return notification;
      })
    );

    res.status(200).json(populatedNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notification" });
  }
};


// Update a notification by ID
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting notification." });
  }
};

// Mark notification as seen
exports.markAsSeen = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of notification IDs." });
    }

    // Update the notifications where _id is in the provided array of IDs
    const updatedNotifications = await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { seen: true } }
    );

    if (updatedNotifications.nModified === 0) {
      return res
        .status(404)
        .json({ message: "No notifications found to update." });
    }

    res.status(200).json({
      message: `Notifications marked as seen.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notifications as seen." });
  }
};


