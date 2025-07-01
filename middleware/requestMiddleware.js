const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Skip logging for specified paths (static assets, health checks, etc.)
const ignorePaths = [
  '/favicon.ico',
  '/health',
  '/static',
  '/assets',
  '/media', // Add media path to ignored paths
];

// Function to determine if request should be logged
const shouldSkipLogging = (req) => {
  return ignorePaths.some(path => req.path.startsWith(path));
};

/**
 * Request tracking middleware
 * - Adds correlation ID to each request
 * - Tracks request timing
 * - Logs all incoming requests
 */
const requestMiddleware = (req, res, next) => {
  // Generate unique correlation ID if not already present
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  // Add correlation ID to response headers for client tracking
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  // Record start time for performance tracking
  req.startTime = Date.now();
  
  // Capture response for logging after it's sent
  const chunks = [];
  const originalWrite = res.write;
  const originalEnd = res.end;

  // Capture response chunks if needed
  res.write = function (chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    originalWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }

    // Calculate request duration
    const duration = Date.now() - req.startTime;
    
    // Only set headers if they haven't been sent yet
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    // Record end time and status
    const statusCode = res.statusCode;
    
    // Determine if we should include response body in logs
    let responseBody = null;
    if (statusCode >= 400 && chunks.length > 0) {
      try {
        // Combine chunks and convert to string
        const body = Buffer.concat(chunks).toString('utf8');
        responseBody = body.length < 1000 ? body : `${body.substring(0, 1000)}... [truncated]`;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Log completed request with status
    if (statusCode >= 400) {
      logger.http(req, `Request completed with error`, { 
        statusCode,
        responseBody,
        responseTime: duration,
        correlationId: req.correlationId
      });
    } else {
      logger.http(req, `Request completed successfully`, { 
        statusCode,
        responseTime: duration,
        correlationId: req.correlationId
      });
    }
    
    // Call original end method
    originalEnd.apply(res, [chunk, ...args]);
  };
  
  // Log incoming request
  if (!shouldSkipLogging(req)) {
    logger.http(req, "Request received", { correlationId: req.correlationId });
  }
  
  next();
};

// Export middleware with conditional logging
module.exports = (req, res, next) => {
  if (shouldSkipLogging(req)) {
    // Still add correlation ID but skip request tracking
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    if (!res.headersSent) {
      res.setHeader('X-Correlation-ID', req.correlationId);
    }
    next();
  } else {
    requestMiddleware(req, res, next);
  }
}; 