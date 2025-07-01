const User = require("../models/User");
const Order = require("../models/OrderModel");
const jwt = require("jsonwebtoken");
const bcryt = require("bcryptjs");
require("dotenv").config();
const {
  sendOtpService,
  resendOtpService,
  verifyOtpService,
} = require("../utils/otpUtil");
const { userDetailsUpdate } = require("../events/communication");
const { USER_TYPES } = require("../constants");
const NodeCache = require("node-cache");
const { generateGuestNo } = require("../helpers/generate-guestno");
const myCache = new NodeCache({ stdTTL: 600 });

exports.createUser = async (req, res) => {
  try {
    const {
      userName,
      phoneNumber,
      email,
      guestId,
      profileImage,
      guest,
      isVerified = false,
      isRestaurant,
    } = req.body;
    if (
      (isRestaurant && !phoneNumber && !guest) ||
      (!isRestaurant && !(userName && phoneNumber) && !guest)
    ) {
      return res.status(400).send({ message: "Unable to authenticate." });
    }
    const newGuestName = await generateGuestNo();
    if (guest) {
      const newUser = new User({
        role: USER_TYPES.guest,
        isVerified: false,
        userName: newGuestName,
      });
      const savedUser = await newUser.save();
      return res.status(201).json(savedUser);
    }
    let user = await User.findOne({ phoneNumber: phoneNumber });
    if (user) {
      if (user.userName !== userName || user.email !== email) {
        return res.status(200).send({
          message: "User already exists",
        });
      }
      if (guestId) {
        await Order.updateMany(
          {
            user_id: guestId,
          },
          {
            $set: {
              user_id: user._id,
            },
            new: true,
          }
        );
        await User.findByIdAndDelete(guestId);
      }
      return res.status(201).send({ isVerified: user.isVerified, user });
    } else {
      if (guestId) {
        user = await User.findByIdAndUpdate(guestId, {
          userName: userName,
          phoneNumber,
          email,
          profileImage,
          role: USER_TYPES.user,
        });
      } else {
        user = new User({
          userName: userName,
          phoneNumber,
          email,
          profileImage,
          isVerified: isVerified,
        });
        await user.save();
      }
      const maxAgeInSeconds = 2 * 24 * 60 * 60; // 2 days in seconds
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "7d", // 2 days
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: maxAgeInSeconds * 1000, // max age in milliseconds
      });
      return res.status(201).send({ message: "New User created", user });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(req.body);

    const user = await User.findOne({ email: email, role: role });
    if (!user) return res.status(400).send({ message: "User not found" });
    if (user) {
      const validPassword = await bcryt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).send({ message: "Invalid Credentials" });
      }
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "7d", // 2 days
        }
      );

      return res.status(200).send({ success: true, token, userId: user._id });
    } else {
      return res.status(400).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.loginAsGuest = async (req, res) => {
  try {
    const guestUserName = await generateGuestNo();
    const newUser = new User({
      role: USER_TYPES.guest,
      isVerified: false,
      userName: guestUserName,
    });
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { userName, phoneNumber, email, image } = req.body;
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (user) {
      user.userName = userName;
      user.profileImage = image;
      user.email = email;
      await user.save();
      userDetailsUpdate(user._id, user);
      return res.status(200).send({ message: "user updated", user: user });
    } else {
      return res.status(200).send({ message: "user not found" });
    }
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
exports.generateToken = async (req, res) => {
  try {
    const maxAgeInSeconds = 2 * 24 * 60 * 60; // 2 days in seconds
    const token = jwt.sign(
      { phoneNumber: req.body.phoneNumber },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d", // 2 days
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: maxAgeInSeconds * 1000, // max age in milliseconds
    });
    return res.status(201).send({ message: "token generated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Middleware to verify user's access token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).send({ message: "no token" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    return res.status(201).send({ message: "valid token" });
  } catch (err) {
    return res.json(err);
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).send({
        success: false,
        message: "Phone number is required",
      });
    }

    // Remove any non-digit characters and ensure it's a string
    const cleanPhoneNumber = phoneNumber.toString().replace(/\D/g, "");

    // Validate phone number length (10 digits for Indian numbers)
    if (cleanPhoneNumber.length !== 10) {
      return res.status(400).send({
        success: false,
        message:
          "Invalid phone number format. Please provide a 10-digit number.",
      });
    }

    const user = await User.findOne({ phoneNumber: cleanPhoneNumber });

    try {
      const response = await sendOtpService(`+91${cleanPhoneNumber}`);

      if (!response || response.success === false) {
        return res.status(400).send({
          success: false,
          userExists: !!user,
          message: response?.errorMessage || "Error in sending OTP",
        });
      }

      // Store orderId in cache with phoneNumber as key
      myCache.set(cleanPhoneNumber, response.orderId);

      return res.status(200).send({
        success: true,
        userExists: !!user,
        message: "OTP sent successfully",
      });
    } catch (otpError) {
      console.error("OTP Service Error:", otpError);
      return res.status(400).send({
        success: false,
        userExists: !!user,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(400).send({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Retrieve orderId from cache
    const orderId = myCache.get(phoneNumber);

    if (!orderId) {
      return res.status(400).send({
        success: false,
        message: "Order ID not found in cache. Please request a new OTP.",
      });
    }

    const response = await resendOtpService(orderId);

    if (response.success === false) {
      return res.status(400).send({
        success: false,
        message: `Error in Resending OTP: ${response.errorMessage}`,
      });
    }

    return res.status(200).send({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, guestId } = req.body;

    const orderId = myCache.get(phoneNumber);

    if (!orderId) {
      return res.status(400).send({
        success: false,
        message: "Order ID not found in cache. Please request a new OTP.",
      });
    }

    const response = await verifyOtpService(`+91${phoneNumber}`, orderId, otp);

    if (response.success === false || response.isOTPVerified === false) {
      return res.status(210).send({
        success: false,
        message: `Error in Verifying OTP: ${
          response.errorMessage || response.reason
        }`,
      });
    }

    let user = await User.findOne({ phoneNumber: phoneNumber });
    if (user && guestId) {
      await Order.updateMany(
        {
          user_id: guestId,
        },
        {
          $set: {
            user_id: user?._id,
          },
        }
      );
    }

    res
      .status(200)
      .send({ success: true, message: "User verified successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
    console.log(error);
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({
      phoneNumber: phoneNumber,
    });
    user.isVerified = true;
    await user.save();
    return res.status(201).send({ message: "user verified" });
  } catch (error) {
    return res.json(error);
  }
};

exports.getUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).send({ message: "no token" });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findOne(
    decoded?.phoneNumber
      ? { phoneNumber: decoded.phoneNumber }
      : { _id: decoded.user_id }
  );
  // const user = await User.findOne({ _id: decoded.user_id });
  return res.status(201).send(user);
};

exports.getRestaurantUser = async (req, res) => {
  try {
    const restaurant_id = req.params.restaurant_id;
    const search = req.query.phoneNumber;
    if (!search) {
      return res.status(200).json({ users: [] });
    }

    if (search && search.length === 10) {
      const user = await User.findOne({ phoneNumber: search }).lean();

      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found with the provided phone number" });
      }
      return res.status(200).json({ users: [user] });
    }

    const searchRegex = new RegExp(search, "i");

    const users = await Order.aggregate([
      {
        $match: {
          restaurant_id: restaurant_id,
          user_id: { $exists: true },
        },
      },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "users", // Lookup from users collection
          localField: "userObjectId", // Local userObjectId field
          foreignField: "_id", // Foreign _id field in users collection
          as: "userDetails", // Save the result as userDetails array
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          $or: [
            { "userDetails.phoneNumber": searchRegex },
            { "userDetails.userName": searchRegex },
          ],
        },
      },
      {
        $group: {
          _id: "$userDetails._id", // Group by user ID
          userName: { $first: "$userDetails.userName" },
          phoneNumber: { $first: "$userDetails.phoneNumber" },
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          phoneNumber: 1,
        },
      },
    ]).allowDiskUse(true); // Allow disk usage for large aggregations

    // Return the list of users
    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error occurred: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logOut = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).send({ message: "no token" });
  }
  // Clear the 'token' cookie
  res.clearCookie("token");
  return res.status(201).send({ message: "user logged out" });
};

exports.getAllRestaurantUsers = async (req, res) => {
  try {
    const {
      filter,
      page = 1,
      limit,
      sortingFilter,
      dueFilter,
      minRange = 0,
      maxRange = 0,
    } = req.query;
    const restaurant_id = req.params.restaurant_id;
    const skip = (page - 1) * (limit ? parseInt(limit) : 0);
    const parsedLimit = limit ? parseInt(limit) : 0;
    const filterCondition = {};

    // Apply general user search filters (name, phone, email)
    if (filter && (filter.length == 3 || filter.length > 3)) {
      const regexFilterCaseSensitive = { $regex: filter, $options: "i" };
      filterCondition.$or = [
        { "userDetails.userName": regexFilterCaseSensitive },
        { "userDetails.phoneNumber": regexFilterCaseSensitive },
        { "userDetails.email": regexFilterCaseSensitive },
      ];
    }

    // Due filter logic
    let filterDue = {
      $gte: minRange ? parseFloat(minRange) : 0,
    };
    if (maxRange) {
      filterDue["$lte"] = parseFloat(maxRange);
    }
    if (dueFilter) {
      if (dueFilter === "Due") {
        filterDue["$gt"] = minRange ? parseFloat(minRange) : 1;
        delete filterDue["$gte"];
      } else if (dueFilter === "No Due") {
        filterDue["$eq"] = 0;
        delete filterDue["$gte"];
      }
    }

    const sortCriteria = {};
    if (sortingFilter) {
      if (sortingFilter === "AtoZ") {
        sortCriteria.userName = 1;
      } else if (sortingFilter === "ZtoA") {
        sortCriteria.userName = -1;
      } else if (sortingFilter === "lowToHigh") {
        sortCriteria.due = 1;
      } else if (sortingFilter === "highToLow") {
        sortCriteria.due = -1;
      }
    }

    const users = await Order.aggregate([
      {
        $match: {
          restaurant_id: restaurant_id,
          user_id: { $exists: true },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.phoneNumber": { $exists: true, $ne: "" },
          ...filterCondition,
        },
      },
      {
        $group: {
          _id: "$userDetails._id",
          userName: { $first: "$userDetails.userName" },
          phoneNumber: { $first: "$userDetails.phoneNumber" },
          email: { $first: "$userDetails.email" },
          due: { $sum: { $ifNull: ["$payment.due", 0] } },
          orderIds: {
            $push: {
              $cond: {
                if: { $gt: ["$payment.due", 0] },
                then: "$_id",
                else: null,
              },
            },
          },
        },
      },
      // Apply the minRange and maxRange filter after calculating the total due
      ((minRange && maxRange) || dueFilter) && {
        $match: {
          due: filterDue,
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          phoneNumber: 1,
          email: 1,
          due: 1,
          orderIds: {
            $filter: {
              input: "$orderIds",
              as: "orderId",
              cond: { $ne: ["$$orderId", null] },
            },
          },
        },
      },
      // Apply combined sorting (userName and due)
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: parsedLimit },
    ]).allowDiskUse(true);

    // Get the total count of users with the same due filter applied
    const totalUsers = await Order.aggregate([
      {
        $match: {
          restaurant_id: restaurant_id,
          user_id: { $exists: true },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.phoneNumber": { $exists: true, $ne: "" },
          ...filterCondition,
        },
      },
      {
        $group: {
          _id: "$userDetails._id",
          due: { $sum: { $ifNull: ["$payment.due", 0] } },
        },
      },
      (minRange && maxRange) || dueFilter
        ? {
            $match: {
              due: filterDue,
            },
          }
        : {},
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]).allowDiskUse(true);

    const total = totalUsers.length ? totalUsers[0].totalCount : 0;

    return res.status(200).json({ users, total });
  } catch (err) {
    console.error("Error occurred: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
