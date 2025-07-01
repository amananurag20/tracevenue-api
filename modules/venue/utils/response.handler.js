/**
 * Standard success response handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data (optional)
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data })
  };
  return res.status(statusCode).json(response);
};

/**
 * Standard error response handler
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
exports.errorResponse = (res, error) => {
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate Entry',
      error: `${Object.keys(error.keyPattern)[0]} already exists`
    });
  }

  // Handle cast errors (invalid IDs)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error response
  console.error('Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { error: error.message })
  });
}; 