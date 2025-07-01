const notificationUser = require("../models/NotificationUser");
const { logger, errorLogger } = require("../config/logger");
require("dotenv").config();
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
const serviceAccount = require("../push-notifications-f5301-firebase-adminsdk-afgjv-a22faabf7d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.createNotificationUser = async (req, res) => {
  try {
    const { userId, userName, notification_token } = req.body;

    // Check if notification_token is provided
    if (!notification_token) {
      return res.status(400).send({ message: "Notification token not found" });
    }

    // Check if any user with the same notification token exists
    const existingUsers = await notificationUser.find({ notification_token });

    if (existingUsers.length > 0) {
      const matchingUser = existingUsers.find((user) => user.userId === userId);

      if (matchingUser) {
        if (matchingUser.userName !== userName) {
          // Update the username if it has changed
          matchingUser.userName = userName;
          await matchingUser.save();
          return res.status(200).send({ message: "User name updated" });
        } else {
          return res
            .status(200)
            .send({ message: "Notification token already up-to-date" });
        }
      }
    }

    // No matching user found or new notification token, create a new user
    const newUser = new notificationUser({
      userId,
      userName,
      notification_token,
    });
    await newUser.save();
    return res.status(201).send({ message: "New user created" });
  } catch (error) {
    res.status(400).send({ message: "Error creating or updating user", error });
    console.log(error);
  }
};

exports.getAllNotificationUser = async (req, res) => {
  try {
    const notificationUsers = await notificationUser.find();
    const notificationTokens = notificationUsers.map(
      (user) => user.notification_token
    );
    return res.json(notificationTokens);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
exports.sendToAll = async (req, res) => {
  try {
    const { title, body, data = {}, icon = null } = req.body;
    const deviceTokens = await getAllNotificationTokens();

    async function sendPushNotifications(
      deviceTokens,
      title,
      body,
      data,
      icon
    ) {
      try {
        const message = {
          // notification: {
          //   title: title,
          //   body: body,
          //   // icon: icon || "/default-icon.png", // Provide a default icon if none is specified
          // },
          data: { ...data, title: title, body: body }, // Include data field if provided
          tokens: deviceTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        return response;
      } catch (error) {
        console.error("Error sending push notification:", error);
        throw error;
      }
    }

    sendPushNotifications(deviceTokens, title, body, data, icon)
      .then((response) => {
        console.log("Push notifications sent successfully:", response);
        res.status(200).send({
          message: "Notifications sent successfully",
          response: response,
        });
      })
      .catch((error) => {
        console.error("Error sending push notifications:", error);
        res.status(500).send({
          message: "Error sending notifications",
          error: error,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.sendToSelected = async (req, res) => {
  try {
    const { userId, title, body, data = {}, icon = null } = req.body;
    const users = await notificationUser.find({ userId });

    if (users.length === 0) {
      return res
        .status(404)
        .send({ message: "No users found with the provided userId." });
    }

    async function sendPushNotification(deviceToken, title, body, data, icon) {
      try {
        const message = {
          // notification: {
          //   title: title,
          //   body: body,
          //   // icon: icon || "/default-icon.png", // Provide a default icon if none is specified
          // },
          data: { ...data, title: title, body: body }, // Include data field if provided
          token: deviceToken,
        };
        console.log(message);

        const response = await admin.messaging().send(message);
        console.log("Push notification sent:", response);
        return response;
      } catch (error) {
        console.error("Error sending push notification:", error);
        throw error;
      }
    }

    const successArray = [];
    const errorArray = [];

    await Promise.all(
      users.map(async (user) => {
        try {
          const response = await sendPushNotification(
            user.notification_token,
            title,
            body,
            data,
            icon
          );
          successArray.push({ userId: user.userId, response });
        } catch (error) {
          errorArray.push({ userId: user.userId, error });
        }
      })
    );

    console.log("Notifications sent successfully to:", successArray.length);
    console.log("Failed notifications:", errorArray.length);

    res.status(200).send({
      message: "Notifications processed",
      success: successArray,
      errors: errorArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

async function getAllNotificationTokens() {
  try {
    const notificationUsers = await notificationUser.find();
    const notificationTokens = notificationUsers.map(
      (user) => user.notification_token
    );
    return notificationTokens;
  } catch (error) {
    console.error("Error getting notification tokens:", error);
    throw error;
  }
}
