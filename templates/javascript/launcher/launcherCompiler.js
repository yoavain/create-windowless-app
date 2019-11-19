const fs = require("fs-extra");
const path = require("path");
const spawn = require("cross-spawn");

function checkCscInPath(exit) {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(";").map((p) => fs.pathExists(path.resolve(p, "csc.exe")));
    return Promise.all(promises)
        .then((results) => {
            return results.find((result) => !!result);
        })
        .then((result) => {
            if (exit && !result) {
                console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
                process.exit(1);
            } else {
                return !!result;
            }
        });
}

function compileLauncher(sourceLocation, iconLocation, outputLocation) {
    return new Promise((resolve, reject) => {
        const command = "csc.exe";
        const args = ["/t:winexe", `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];
        const child = spawn(command, args, { stdio: "inherit" });
        child.on("close", (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(" ")}`
                });
                return;
            }
            resolve();
        });
    });
}

module.exports = { checkCscInPath, compileLauncher };
