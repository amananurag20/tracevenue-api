const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { USER_TYPES } = require("../constants");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.authToken ||
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Token verification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies?.authToken ||
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user is a super admin
    if (user.role !== USER_TYPES.superAdmin) {
      return res.status(403).json({ message: "Access denied. Super admin access required." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Super admin authentication error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = {
  authMiddleware,
  authenticateSuperAdmin
};
