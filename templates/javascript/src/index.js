const path = require("path");
const winston = require('winston');
const { WindowsToaster } = require('node-notifier');

// Notifier init
const argv = process.argv;
const snoreToastPath = argv[0] === "node.exe" ? null : path.join(argv[0], "../", "SnoreToast.exe");
const notifier = new WindowsToaster({withFallback: !!snoreToastPath, customPath: snoreToastPath});

// Logger init
const { combine, timestamp, printf, label } = winston.format;
const transports = {
    file: new winston.transports.File({ filename: "app.log" })
};
transports.file.level = "debug";
const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({ label: '[my-label]' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        printf(info => `${ info.timestamp } [${ info.level.toUpperCase() }] ${ info.message }`)
    ),
    transports: [transports.file]
});


// Log message
logger.log("info", "Hello World");

// Notify
notifier.notify({title: 'APP NAME',  message: 'Hello World' });
