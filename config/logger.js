const winston = require('winston');
const Transport = require('winston-transport');

const Colors = {
    info: "\x1b[36m",    // Cyan color for info
    error: "\x1b[31m",   // Red color for error
    debug: "\x1b[35m"    // Magenta color for debug
};

class ColorfulConsoleTransport extends Transport {
    constructor() {
        super();
    }
    log(info, callback) {
        const { level, message, stack } = info;
        const color = Colors[level] || ""; // Get color based on log level, default to empty string if color not found
        console.log(
            `${color}${level}\t${message}\x1b[0m`,
            stack ? "\n" + stack : ""
        );
        if (callback) {
            callback();
        }
    }
}

// Initialize different loggers
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new ColorfulConsoleTransport()
    ]
});

const errorLogger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new ColorfulConsoleTransport()
    ]
});

const debugLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new ColorfulConsoleTransport()
    ]
});

module.exports = {
    logger,
    errorLogger,
    debugLogger
};
