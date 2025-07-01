const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const signup = async (req, res) => {
  const {
    username,
    email,
    password,
    name,
    contact,
    role,
    isApproved,
    approvalStatus,
  } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password || !name || !contact || !role) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["username", "email", "password", "name", "contact", "role"],
      });
    }

    const userExist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExist) {
      return res.status(400).json({
        message:
          userExist.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    // Validate role
    if (!["vendor", "customer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be either 'vendor' or 'customer'",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      name,
      contact,
      role,
      ...(approvalStatus && {
        isApproved,
        approvalStatus,
      }),
    });

    const savedUser = await newUser.save();

    // Generate token for immediate login
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message || "Unknown error occurred",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // The user object is already attached by the protect middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      contact: user.contact,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    console.error("Error in reset password:", error);
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getUserDetails,
  forgotPassword,
  resetPassword,
};
