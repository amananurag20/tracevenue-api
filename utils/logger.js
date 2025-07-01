const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { format } = winston;
const { combine, timestamp, json, printf } = format;
const { v4: uuidv4 } = require('uuid');

// Get hostname for logging
const hostname = os.hostname();

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const structuredFormat = printf(({ level, message, timestamp, correlationId, ...rest }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    correlationId: correlationId || undefined,
    ...rest
  });
});

// Create file transports with rotation
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 2 weeks
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), structuredFormat)
});

const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), structuredFormat)
});

// Create the logger without console transport
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    structuredFormat
  ),
  defaultMeta: { 
    service: 'tracevenue-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    combinedFileTransport,
    errorFileTransport
  ]
});

// Function to extract user info from request
const extractUserInfo = (req) => {
  if (!req.user) return { userId: 'anonymous', role: 'none' };
  
  return {
    userId: req.user.userId || req.user._id || 'anonymous',
    email: req.user.email,
    role: req.user.role || 'user',
    restaurantId: req.user.restaurantId
  };
};

// Extract request details without sensitive information
const extractRequestDetails = (req) => {
  // Extract basic request info
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
  };
  
  // Add query parameters (filter out sensitive keys)
  if (Object.keys(req.query || {}).length > 0) {
    const safeQuery = { ...req.query };
    ['password', 'token', 'apiKey', 'secret'].forEach(key => {
      if (safeQuery[key]) safeQuery[key] = '[REDACTED]';
    });
    requestInfo.query = safeQuery;
  }
  
  // Add route params if available
  if (Object.keys(req.params || {}).length > 0) {
    requestInfo.params = req.params;
  }
  
  return requestInfo;
};

// Helper functions with enhanced logging capabilities
module.exports = {
  info: (message, meta = {}) => logger.info(message, { 
    ...meta, 
    hostname,
    correlationId: meta.correlationId
  }),
  
  warn: (message, meta = {}) => logger.warn(message, { 
    ...meta, 
    hostname,
    correlationId: meta.correlationId
  }),
  
  error: (err, meta = {}) => {
    if (err instanceof Error) {
      return logger.error(err.message, { 
        stack: err.stack,
        name: err.name,
        code: err.code,
        ...meta,
        hostname,
        correlationId: meta.correlationId
      });
    }
    return logger.error(err, { 
      ...meta, 
      hostname,
      correlationId: meta.correlationId
    });
  },
  
  debug: (message, meta = {}) => logger.debug(message, { 
    ...meta, 
    hostname,
    correlationId: meta.correlationId
  }),
  
  http: (req, message, meta = {}) => {
    // Generate or use existing correlation ID
    const correlationId = req.correlationId || meta.correlationId || uuidv4();
    
    // Extract user information
    const userInfo = extractUserInfo(req);
    
    // Extract request details
    const requestDetails = extractRequestDetails(req);
    
    // Build HTTP metadata
    const httpMeta = {
      ...requestDetails,
      ...userInfo,
      statusCode: meta.statusCode || (req.res?.statusCode || 200),
      responseTime: meta.responseTime,
      ...meta,
      correlationId,
      hostname
    };
    
    // Clean up log message for better readability
    const cleanMessage = `${req.method} ${req.originalUrl || req.url}: ${message}`;
    
    return logger.http(cleanMessage, httpMeta);
  },
  
  task: (taskId, message, meta = {}) => {
    return logger.info(`Task #${taskId}: ${message}`, { 
      taskId,
      ...meta,
      correlationId: meta.correlationId || uuidv4(),
      hostname
    });
  },
  
  // Performance logging helper
  performance: (name, duration, meta = {}) => {
    return logger.info(`Performance: ${name} took ${duration}ms`, {
      metric: 'performance',
      name,
      duration,
      ...meta,
      hostname,
      correlationId: meta.correlationId
    });
  },
  
  // Business event logger
  event: (eventName, data = {}, meta = {}) => {
    return logger.info(`Event: ${eventName}`, {
      eventName,
      eventData: data,
      ...meta,
      correlationId: meta.correlationId || uuidv4(),
      hostname
    });
  }
}; 