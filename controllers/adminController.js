const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const bcryt = require("bcryptjs");
const { USER_TYPES, RES_MEMBERS } = require("../constants");
const {
  sendOtpService,
  verifyOtpService,
  verifyRestaurantRegistrationOtp,
} = require("../utils/otpUtil");
const Restaurant = require("../models/RestaurantModels");
require("dotenv").config();

exports.addAdminUser = async (req, res) => {
  const {
    username,
    email,
    password,
    associatedWith,
    approvalStatus,
    isApproved,
  } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "user already existed" });
  }

  const hashpassword = await bcryt.hash(password, 10);
  const newUser = new User({
    userName: username,
    email,
    password: hashpassword,
    associatedWith,
    role: USER_TYPES.restaurant,
    staffRole: RES_MEMBERS.Owner,
    isVerified: true,
    ...(approvalStatus && { approvalStatus, isApproved }),
  });

  await newUser.save();
  return res.json({ status: true, message: "record registered" });
};

exports.loginAdminUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({
      email,
      $or: [
        { role: USER_TYPES.restaurant },
        { role: USER_TYPES.staff, staffRole: RES_MEMBERS.Owner },
      ],
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const validPassword = await bcryt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "Please verify your phone number first",
      });
    }

    // For restaurant owners, check approval status
    if (user.role === USER_TYPES.restaurant) {
      if (!user.isApproved) {
        return res.status(400).json({
          status: false,
          message:
            "Your account is pending approval from admin. Please wait for approval.",
          approvalStatus: user.approvalStatus,
        });
      }
    }

    // Handle array of associated restaurants
    if (typeof user.associatedWith === "string") {
      user.associatedWith = [user.associatedWith];
    }

    // Generate token with expiration time
    const expiresIn = "2d"; // 2 days
    const adminToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        userName: user.userName,
        exp: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60), // 2 days in seconds
      },
      process.env.JWT_SECRET_KEY
    );

    // Calculate expiration timestamp
    const expirationTime = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000); // 2 days in milliseconds

    return res.status(200).json({
      status: true,
      id: user._id,
      restaurantId: user.associatedWith,
      message: "Login successful",
      userName: user.userName,
      role: user.role,
      token: adminToken,
      expiresAt: expirationTime.getTime(), // Send expiration timestamp to client
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error during login",
      details: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "user not registered" });
    }
    const adminTokenReset = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );

    const encodedToken = encodeURIComponent(adminTokenReset).replace(
      /\./g,
      "%2E"
    );
    const resetUrl = `${process.env.RES_BASE_URL}/resetPassword/${encodedToken}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: process.env.MY_MAIL, // Use the email address or domain you verified with SendGrid
      subject: "Reset Password",
      text: resetUrl,
      html: `<p>Hi ${user.userName},</p><p>We have receieved a request to reset your password</p><p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
    };
    await sgMail.send(msg);

    return res.json({ status: true, message: "email sent" });
  } catch (err) {
    return res.json({ message: "error sending email" });
  }
};
exports.resetPassword = async (req, res) => {
  const { adminTokenReset } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(adminTokenReset, process.env.JWT_SECRET_KEY);
    const id = decoded.id;
    const hashPassword = await bcryt.hash(password, 10);
    await User.findByIdAndUpdate(
      { _id: id },
      { password: hashPassword, isVerified: true }
    );
    return res.json({ status: true, message: "updated password" });
  } catch (err) {
    return res.json({ message: err });
  }
};
exports.verifyPassword = async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.json({ message: "user is not registered" });
    }

    const validPassword = await bcryt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: "password is incorrect", status: false });
    } else {
      return res.json({ status: true, message: "valid password" });
    }
  } catch (err) {
    return res.json({ message: err });
  }
};
exports.changePassword = async (req, res) => {
  const { id, password } = req.body;
  try {
    const hashPassword = await bcryt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "updated password" });
  } catch (err) {
    return res.json({ message: err });
  }
};
exports.verifyUser = async (req, res) => {
  try {
    const adminToken = req.cookies.adminToken;
    if (!adminToken) {
      return res.json({ status: false, message: "no token" });
    }
    const decoded = await jwt.verify(adminToken, process.env.JWT_SECRET_KEY);
    if (decoded) {
      return res.json({ status: true, message: "valid token" });
    }
  } catch (err) {
    return res.json(err);
  }
};
exports.logOut = async (req, res) => {
  res.clearCookie("adminToken");
  return res.json({ status: true });
};

/// Staff Management API's
exports.addRestaurantMember = async (req, res) => {
  const { username, email, phoneNumber, associatedWith, role } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (user) {
      return res.json({
        message:
          "Staff already exists with the provided email or phone number.",
      });
    }
    const newUser = new User({
      userName: username,
      email,
      phoneNumber,
      associatedWith,
      role: USER_TYPES.staff,
      staffRole: role,
      isVerified: false,
    });
    await newUser.save();
    const adminTokenReset = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );

    const encodedToken = encodeURIComponent(adminTokenReset).replace(
      /\./g,
      "%2E"
    );
    const resetUrl = `${process.env.RES_BASE_URL}/resetPassword/${encodedToken}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: process.env.MY_MAIL, // Use the email address or domain you verified with SendGrid
      subject: "Set Password",
      text: resetUrl,
      html: `<h3>Hi ${username},</h3><p>Click <a href="${resetUrl}">here</a> to set your password</p>`,
    };
    await sgMail.send(msg);

    return res.json({ status: true, message: "Email sent" });
  } catch (err) {
    return res.json({ message: err });
  }
};

exports.getRestaurantMembers = async (req, res) => {
  try {
    const { filter = "", page = 1, limit } = req.query;
    const branchIds = req.body;
    let pipeline = [];

    let matchStage = {
      associatedWith: { $in: branchIds },
      role: USER_TYPES.staff,
    };

    if (filter) {
      const searchRegex = new RegExp(filter, "i");
      matchStage.$or = [
        { userName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$phoneNumber" },
              regex: searchRegex,
            },
          },
        },
        { staffRole: { $regex: searchRegex } },
      ];
    }

    pipeline.push({ $match: matchStage });

    // Sort by username in ascending order before pagination
    pipeline.push({ $sort: { userName: 1 } });

    // Use $facet to run both the paginated query and the count query in parallel
    pipeline.push({
      $facet: {
        staff: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],
        total: [{ $count: "total" }],
      },
    });

    // Execute the aggregation
    const result = await User.aggregate(pipeline);
    const staff = result[0].staff;
    const total = result[0].total.length > 0 ? result[0].total[0].total : 0;

    return res.json({ staff, total });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching staff." });
  }
};

exports.deleteRestaurantMember = async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await User.findByIdAndDelete(id);
    return res.json({ message: "Staff deleted successfully", staff });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the staff." });
  }
};

exports.updateRestaurantMember = async (req, res) => {
  const { username, email, phoneNumber, associatedWith, role } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (!user) {
      return res.json({
        message: "No staff found with the provided email or phone number.",
      });
    }
    const staff = await User.findByIdAndUpdate(
      id,
      {
        userName: username,
        email,
        phoneNumber,
        associatedWith,
        role,
      },
      { new: true }
    );
    if (!staff) {
      return res.json({
        message: "Staff not found or update failed.",
      });
    }
    return res.json({ message: "Staff updated successfully", staff });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the staff." });
  }
};

// Restaurant owner signup
exports.restaurantOwnerSignup = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Input validation
    if (!email || !phoneNumber || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required:  email, phoneNumber, password",
      });
    }

    // Clean and validate phone number
    let cleanedPhoneNumber = phoneNumber
      .toString()
      .replace(/[\s\-\(\)\+]/g, "");

    // Remove country code if present (e.g., +91, 91)
    if (
      cleanedPhoneNumber.startsWith("91") &&
      cleanedPhoneNumber.length === 12
    ) {
      cleanedPhoneNumber = cleanedPhoneNumber.substring(2);
    } else if (
      cleanedPhoneNumber.startsWith("+91") &&
      cleanedPhoneNumber.length === 13
    ) {
      cleanedPhoneNumber = cleanedPhoneNumber.substring(3);
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(cleanedPhoneNumber)) {
      return res.status(400).json({
        status: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber: cleanedPhoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User with this email or phone number already exists",
      });
    }

    // Send OTP using otpless service
    const otpResponse = await sendOtpService(cleanedPhoneNumber);

    if (!otpResponse.success) {
      // Delete the user if OTP sending fails
      return res.status(400).json({
        status: false,
        message: otpResponse.errorMessage,
        details: otpResponse.details,
      });
    }

    res.status(201).json({
      status: true,
      message:
        "Registration initiated successfully. Please verify your phone number.",
      phoneNumber: cleanedPhoneNumber,
      orderId: otpResponse.orderId,
    });
  } catch (error) {
    console.error("Restaurant Owner Signup Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error during registration",
      details: error.message,
    });
  }
};

// New function to verify restaurant registration OTP
exports.verifyRestaurantRegistrationOTP = async (req, res) => {
  try {
    const { name, phoneNumber, email, password, otp, orderId } = req.body;
    if (!name || !phoneNumber || !email || !password || !otp || !orderId) {
      return res.status(400).json({
        status: false,
        message: "OTP, and Order ID are required",
      });
    }

    // Format phone number for verification
    let formattedPhoneNumber = phoneNumber;
    if (!formattedPhoneNumber.startsWith("+")) {
      formattedPhoneNumber = formattedPhoneNumber.startsWith("91")
        ? `+${formattedPhoneNumber}`
        : `+91${formattedPhoneNumber}`;
    }

    // Verify OTP
    const verificationResponse = await verifyRestaurantRegistrationOtp(
      formattedPhoneNumber,
      orderId,
      otp
    );

    if (!verificationResponse.success) {
      return res.status(400).json({
        status: false,
        message: verificationResponse.errorMessage || "Invalid OTP",
        details: verificationResponse.details || {},
      });
    }
    // Hash password
    const hashPassword = await bcryt.hash(password, 10);

    // Create user with pending status
    const newUser = new User({
      userName: name,
      email: email,
      phoneNumber: phoneNumber,
      password: hashPassword,
      role: USER_TYPES.restaurant,
      isVerified: true,
      traceVenueStatus: "pending",
      staffRole: RES_MEMBERS.Owner,
    });

    await newUser.save();
    const user = await User.findOne({ phoneNumber: phoneNumber });
    // Generate JWT token for authenticated access
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      status: true,
      message:
        "Phone number verified successfully. Your account is pending admin approval. You will be able to login once an admin approves your account.",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
      requiresApproval: true,
    });
  } catch (error) {
    console.error("Restaurant Registration OTP Verification Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error during OTP verification",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Verify phone number with OTP
exports.verifyPhoneNumber = async (req, res) => {
  try {
    const { userId, orderId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if orderId matches
    if (user.otpOrderId !== orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid verification attempt",
      });
    }

    // Verify OTP using otpless service
    const verifyResponse = await verifyOtpService(
      user.phoneNumber,
      orderId,
      otp
    );

    if (!verifyResponse.success) {
      return res.status(400).json({
        status: false,
        message: verifyResponse.errorMessage || "Invalid or expired OTP",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.otpOrderId = undefined; // Clear the orderId after successful verification
    await user.save();

    // Send email to super admin about new registration
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (adminEmail) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: adminEmail,
        from: process.env.MY_MAIL,
        subject: "New Restaurant Registration",
        html: `
          <h3>New Restaurant Registration Pending Approval</h3>
          <p>Restaurant Details:</p>
          <ul>
            <li>Name: ${user.userName}</li>
            <li>Email: ${user.email}</li>
            <li>Phone: ${user.phoneNumber}</li>
          </ul>
          <p>Please review and take necessary action.</p>
        `,
      };
      await sgMail.send(msg);
    }

    res.status(200).json({
      status: true,
      message:
        "Phone number verified successfully. Waiting for admin approval.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Error in verification process",
    });
  }
};

// Super admin approve/reject restaurant
exports.approveRejectRestaurant = async (req, res) => {
  try {
    const { userId, action, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (action === "approve") {
      user.isApproved = true;
      user.approvalStatus = "approved";
      user.traceVenueStatus = "approved";
      user.approvedAt = new Date();

      // Send approval email
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: process.env.MY_MAIL,
        subject: "Restaurant Account Approved",
        html: `
          <h3>Congratulations ${user.userName}!</h3>
          <p>Your restaurant account has been approved. You can now login to your account using your email and password.</p>
          <p>Login URL: ${process.env.RES_BASE_URL}/login</p>
          <p>Thank you for choosing our platform!</p>
        `,
      };
      await sgMail.send(msg);
    } else if (action === "reject") {
      user.isApproved = false;
      user.approvalStatus = "rejected";
      user.rejectionReason = reason;
      user.rejectedAt = new Date();

      // Send rejection email
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: process.env.MY_MAIL,
        subject: "Restaurant Account Status Update",
        html: `
          <h3>Hello ${user.userName},</h3>
          <p>We regret to inform you that your restaurant account registration has been rejected.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ""}
          <p>If you believe this is a mistake or would like to provide additional information, please contact our support team.</p>
        `,
      };
      await sgMail.send(msg);
    }

    await user.save();

    res.status(200).json({
      status: true,
      message: `Restaurant ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        approvalStatus: user.approvalStatus,
        ...(action === "reject" && { rejectionReason: user.rejectionReason }),
      },
    });
  } catch (error) {
    console.error("Restaurant Approval Error:", error);
    res.status(500).json({
      status: false,
      message: "Error in approval process",
      details: error.message,
    });
  }
};

// Get pending restaurant approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: USER_TYPES.restaurant,
      isVerified: true,
      isApproved: false,
    }).select("-password");

    res.status(200).json({
      status: true,
      data: pendingUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Error fetching pending approvals",
    });
  }
};

// Request TraceVenue approval for existing restaurant
exports.requestTraceVenueApproval = async (req, res) => {
  try {
    const { restaurantId, restaurantDetails } = req.body;

    // First try to find the restaurant directly by ID
    let restaurant = await User.findOne({
      _id: restaurantId,
      role: USER_TYPES.restaurant,
      isApproved: true,
    });

    // If not found, try to find by associatedWith
    if (!restaurant) {
      restaurant = await User.findOne({
        associatedWith: { $in: [restaurantId] },
        role: USER_TYPES.restaurant,
        isApproved: true,
      });
    }

    if (!restaurant) {
      return res.status(404).json({
        status: false,
        message:
          "Restaurant not found or not approved. Please ensure your restaurant account is approved.",
      });
    }

    // Check if restaurant already has a TraceVenue status
    if (
      restaurant.traceVenueStatus === "pending" ||
      restaurant.traceVenueStatus === "approved"
    ) {
      return res.status(400).json({
        status: false,
        message: "A TraceVenue request already exists for this restaurant",
        traceVenueStatus: restaurant.traceVenueStatus,
      });
    }

    // Update the restaurant with TraceVenue details
    restaurant.traceVenueStatus = "pending";
    restaurant.restaurantDetails = {
      ...restaurantDetails,
      updatedAt: new Date(),
    };

    await restaurant.save();

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.MY_MAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New TraceVenue Approval Request",
      html: `
        <h3>New TraceVenue Approval Request</h3>
        <p>A restaurant has requested to join TraceVenue:</p>
        <ul>
          <li>Restaurant Name: ${restaurant.userName}</li>
          <li>Email: ${restaurant.email}</li>
          <li>Phone: ${
            restaurant.phoneNumber || restaurantDetails.phoneNumber
          }</li>
          <li>Address: ${restaurantDetails.address}</li>
          <li>District: ${restaurantDetails.district}</li>
          <li>State: ${restaurantDetails.state}</li>
        </ul>
        <p>Please review their application in the admin dashboard.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: true,
      message: "TraceVenue approval request submitted successfully",
      traceVenueStatus: "pending",
    });
  } catch (error) {
    console.error("TraceVenue Approval Request Error:", error);
    res.status(500).json({
      status: false,
      message: "Error submitting TraceVenue approval request",
      details: error.message,
    });
  }
};

// Get TraceVenue status for a restaurant
exports.getTraceVenueStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // First try to find the restaurant directly by ID
    let restaurant = await User.findOne({
      _id: restaurantId,
      role: USER_TYPES.restaurant,
    });

    // If not found, try to find by associatedWith
    if (!restaurant) {
      restaurant = await User.findOne({
        associatedWith: { $in: [restaurantId] },
        role: USER_TYPES.restaurant,
      });
    }

    if (!restaurant) {
      return res.status(404).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      status: true,
      traceVenueStatus: restaurant.traceVenueStatus || "not_requested",
      traceVenueRejectionReason: restaurant.traceVenueRejectionReason,
    });
  } catch (error) {
    console.error("Error fetching TraceVenue status:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching TraceVenue status",
      details: error.message,
    });
  }
};

// Get all pending venue requests
exports.getPendingVenues = async (req, res) => {
  try {
    const venues = await User.find({
      role: USER_TYPES.restaurant,
      $or: [{ traceVenueStatus: "pending" }, { traceVenueStatus: "rejected" }],
    }).select(
      "userName email phoneNumber traceVenueStatus traceVenueRejectionReason"
    );

    return res.status(200).json({
      status: true,
      venues,
    });
  } catch (error) {
    console.error("Error fetching pending venues:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching pending venues",
    });
  }
};

// Update venue approval status
exports.updateVenueStatus = async (req, res) => {
  const { venueId, status, reason } = req.body;

  try {
    const venue = await User.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        status: false,
        message: "Venue not found",
      });
    }

    // Update TraceVenue status
    venue.traceVenueStatus = status;

    if (status === "approved") {
      venue.isApproved = true; // Also set main approval flags
      venue.approvalStatus = "approved";
      venue.traceVenueRejectionReason = undefined; // Clear any previous rejection reason
    } else if (status === "rejected") {
      if (reason) {
        venue.traceVenueRejectionReason = reason;
      } else {
        venue.traceVenueRejectionReason = undefined; // Clear reason if not provided
      }
    }

    // Defensive fix for staffRole inconsistency
    if (
      venue.role === USER_TYPES.restaurant &&
      venue.staffRole &&
      venue.staffRole.toLowerCase() === "owner"
    ) {
      venue.staffRole = RES_MEMBERS.Owner; // Correct to the valid enum "Owner"
    }

    await venue.save();

    // Send email notification (non-blocking)
    (async () => {
      try {
        const emailSubject =
          status === "approved"
            ? "Your Venue Account Has Been Approved"
            : "Your Venue Account Application Status";

        const emailBody =
          status === "approved"
            ? `<p>Congratulations! Your venue account has been approved. You can now log in to your account.</p>`
            : `<p>Your venue account application has been rejected.${
                reason ? `<p>Reason: ${reason}</p>` : ""
              }<p>Please contact support if you have any questions.</p>`;

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: venue.email,
          from: process.env.MY_MAIL,
          subject: emailSubject,
          html: emailBody,
        };

        await sgMail.send(msg);
      } catch (emailError) {
        console.error("SendGrid email error:", emailError.message);
        // Optional: log the full error or save it to DB for audit
      }
    })();

    // Respond without waiting for email
    return res.status(200).json({
      status: true,
      message: `Venue ${status} successfully`,
      venue: {
        id: venue._id,
        userName: venue.userName,
        email: venue.email,
        traceVenueStatus: venue.traceVenueStatus,
        ...(venue.traceVenueRejectionReason && {
          traceVenueRejectionReason: venue.traceVenueRejectionReason,
        }),
      },
    });
  } catch (error) {
    console.error("Error updating venue status:", error);
    return res.status(500).json({
      status: false,
      message: "Error updating venue status",
    });
  }
};
