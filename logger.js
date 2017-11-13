const winston = require("winston");
const join = require("path").join;

/**
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   verbose: 3,
 *   debug: 4,
 *   silly: 5
 */
const logger = winston.createLogger({
    level: "info", // write to logs from debug level and more important
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: join(__dirname, 'logs/dh-error.log'), level: 'error' }),
        new winston.transports.File({ filename: join(__dirname, 'logs/dh-warn.log'), level: 'warn' }),
        new winston.transports.File({ filename: join(__dirname, 'logs/dh-info.log'), level: 'info' })
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports.logger = logger;