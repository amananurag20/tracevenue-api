const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-key';

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (excluding password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user info to request
      req.user = user;
      next();
    } catch (error) {   
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
