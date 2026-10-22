const path = require("path");
const winston = require("winston");
const { WindowsToaster } = require("node-notifier");
const { spawn } = require("child_process");

// App Name
const AppName = "##APPNAME##";

const executable = process.argv[0];

// Args (ignore exe + js)
const argv = process.argv.slice(2);

// Logger init
const { combine, timestamp, printf, label } = winston.format;
// Absolute path, so the logger and the "Log" action use the same file
const logFile = path.resolve(`${AppName}.log`);
const transports = {
    file: new winston.transports.File({ filename: logFile })
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

// Open a file with its default app. The encoded command keeps special characters in the path literal
const openFile = (file) => {
    const script = `Invoke-Item -LiteralPath '${file.replace(/'/g, "''")}'`;
    const encoded = Buffer.from(script, "utf16le").toString("base64");
    spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], {
        stdio: "ignore",
        windowsHide: true
    }).on("error", (error) => logger.log("error", `Failed to open ${file}: ${error.message}`));
};

// Notifier init
const snoreToastPath = executable.endsWith(".exe") ? path.resolve(executable, "../", "snoretoast-x64.exe") : null;
let notifierOptions = { withFallback: false, customPath: snoreToastPath };
const notifier = new WindowsToaster(notifierOptions);

// Log message
logger.log("info", `"${AppName}" started with ${argv ? argv.join("; ") : "no args"}`);
logger.log("info", `Notifier started with options ${JSON.stringify(notifierOptions)}`);

// Notify
const notification = { title: `${AppName}`, message: "Hello World", actions: ["Log", "Close"] };
notifier.notify(notification);
notifier.on("log", () => {
    openFile(logFile);
});
