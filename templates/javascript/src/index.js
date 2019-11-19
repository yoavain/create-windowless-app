const path = require("path");
const winston = require("winston");
const { WindowsToaster } = require("node-notifier");

// App Name
const AppName = "<APPNAME>";

const executable = process.argv[0];

// Args (ignore exe + js)
const argv = process.argv.slice(2);

// Logger init
const { combine, timestamp, printf, label } = winston.format;
const transports = {
    file: new winston.transports.File({ filename: `${AppName}.log` })
};
transports.file.level = "debug";
const logger = winston.createLogger({
    level: "debug",
    format: combine(
        label({ label: "[my-label]" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        printf((info) => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
    ),
    transports: [transports.file]
});

// Notifier init
const snoreToastPath = executable.endsWith(".exe") ? path.resolve(executable, "../", "snoretoast-x64.exe") : null;
let notifierOptions = { withFallback: false, customPath: snoreToastPath };
const notifier = new WindowsToaster(notifierOptions);

// Log message
logger.log("info", `"${AppName}" started with ${argv ? argv.join("; ") : "no args"}`);
logger.log("info", `Notifier started with options ${JSON.stringify(notifierOptions)}`);

// Notify
notifier.notify({ title: `${AppName}`, message: "Hello World" });
