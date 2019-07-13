import * as winston from 'winston';
import notifier from 'node-notifier';

// Logger init
const {combine, timestamp, printf, label} = winston.format;
const transports = {
    file: new winston.transports.File({filename: "app.log"})
};
transports.file.level = "debug";
const logger: winston.Logger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({label: '[my-label]'}),
        timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
        printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
    ),
    transports: [transports.file]
});


// Log message
logger.log("info", "Hello World");

// Notify
notifier.notify('Hello World');
