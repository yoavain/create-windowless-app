import * as path from "path";
import * as winston from "winston";
import { WindowsToaster } from "node-notifier";
import { spawn } from "child_process";
import { isSea } from "node:sea";
import type { NotifierOptions } from "node-notifier";

// App Name
const AppName: string = "##APPNAME##";

const executable: string = process.argv[0];

// Args (ignore exe + js)
const argv: string[] = process.argv.slice(2);

// Logger init
const { combine, timestamp, printf, label } = winston.format;
// Absolute path, so the logger and the "Log" action use the same file
const logFile: string = path.resolve(`${AppName}.log`);
const transports = {
    file: new winston.transports.File({ filename: logFile })
};
transports.file.level = "debug";
const logger: winston.Logger = winston.createLogger({
    level: "debug",
    format: combine(
        label({ label: "[my-label]" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        printf((info) => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
    ),
    transports: [transports.file]
});

// Open a file with its default app. The encoded command keeps special characters in the path literal
const openFile = (file: string): void => {
    const script: string = `Invoke-Item -LiteralPath '${file.replace(/'/g, "''")}'`;
    const encoded: string = Buffer.from(script, "utf16le").toString("base64");
    spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], {
        stdio: "ignore",
        windowsHide: true
    }).on("error", (error: Error) => logger.log("error", `Failed to open ${file}: ${error.message}`));
};

// Notifier init
// Only the packaged app has SnoreToast next to it. Under plain Node, node-notifier uses its own copy
const snoreToastPath: string = isSea() ? path.resolve(executable, "../", "snoretoast-x64.exe") : null;
let notifierOptions: NotifierOptions = { withFallback: false, customPath: snoreToastPath };
const notifier: WindowsToaster = new WindowsToaster(notifierOptions);

// Log message
logger.log("info", `"${AppName}" started with ${argv ? argv.join("; ") : "no args"}`);
logger.log("info", `Notifier started with options ${JSON.stringify(notifierOptions)}`);

// Notify
const notification = { title: `${AppName}`, message: "Hello World", actions: ["Log", "Close"] };
notifier.notify(notification);
notifier.on("log", () => {
    openFile(logFile);
});
