const logger = require('../utils/logger');

/**
 * Enhanced error logging middleware with correlation ID tracking
 */
const errorLogger = (err, req, res, next) => {
  // Determine error type and code
  const type = err.name || 'Exception';
  const code = err.code || 'Exception';
  const statusCode = err.statusCode || 500;
  
  // Log the error with the request's correlation ID
  logger.error(err, {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode,
    code,
    type,
    correlationId: req.correlationId,
    // Include essential request details for debugging
    query: req.query,
    params: req.params,
    // Include basic user info if available
    userId: req.user?.userId || req.user?._id || 'anonymous',
    role: req.user?.role
  });

  // Determine if this is an API response or not
  const isApiRequest = req.xhr || 
    req.headers.accept?.includes('application/json') || 
    req.path.includes('/api/');

  // Set default error response
  const message = err.message || 'Something went wrong';
  
  // Send appropriate response based on request type
  if (isApiRequest) {
    // API response with correlation ID for tracking
    res.status(statusCode).json({
      status: 'error',
      message,
      code: code,
      correlationId: req.correlationId
    });
  } else {
    // For non-API requests, render error page or redirect
    // You can customize this based on your application needs
    res.status(statusCode).json({
      status: 'error',
      message,
      correlationId: req.correlationId
    });
  }
};

module.exports = errorLogger; 