const winston = require("winston");
const join = require("path").join;

const reminderLevel = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5,
        reminder: 6
    },
    colors: {
        error: "red",
        warn: "orange",
        info: "green",
        verbose: "yellow",
        debug: "gray",
        silly: "blue",
        reminder: "cyan"
    }
};

/**
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   verbose: 3,
 *   debug: 4,
 *   silly: 5
 *   reminder: 6
 */
const logger = winston.createLogger({
    level: "reminder", // write to logs from debug level and more important
    levels: reminderLevel.levels, // custom logger level for reminder functionality hashtags
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
        winston.format.json()
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: join(__dirname, 'logs/dh-reminder.log'), level: 'reminder' }),
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