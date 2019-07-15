const path = require("path");
const winston = require('winston');
const { WindowsToaster } = require('node-notifier');

// App Name
const AppName = "<APPNAME>";

// Args (ignore exe + js)
const argv = process.argv.slice(2);

// Notifier init
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
logger.log("info", `"${AppName}" started with ${argv ? argv.join("; ") : "no args"}`);

// Notify
notifier.notify({title: `${AppName}`,  message: 'Hello World' });
