const winston = require("winston");

/**
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   verbose: 3,
 *   debug: 4,
 *   silly: 5
 */
const logger = winston.createLogger({
    level: "verbose", // write to logs from debug level and more important
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: './logs/dh-error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/dh-warn.log', level: 'warn' }),
        new winston.transports.File({ filename: './logs/dh-info.log', level: 'info' }),
        new winston.transports.File({ filename: './logs/dh-verbose.log', level: 'verbose' })
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports.logger = logger;