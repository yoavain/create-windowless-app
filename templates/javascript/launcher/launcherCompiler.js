const fs = require("fs-extra");
const path = require("path");
const spawn = require("cross-spawn");

const checkCscInPath = async (exit) => {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(";").map((p) => fs.pathExists(path.resolve(p, "csc.exe")));
    const results = await Promise.all(promises);
    const cscFound = await results.find((result) => !!result);

    if (exit && !cscFound) {
        console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
        process.exit(1);
    } else {
        return cscFound;
    }
};

const compileLauncher = async (sourceLocation, outputLocation, iconLocation) => {
    const command = "csc.exe";
    const args = ["/t:winexe", `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];

    const spawnResult = spawn.sync(command, args, { stdio: "inherit" });
    if (spawnResult.status !== 0) {
        throw new Error(`${command} ${args.join(" ")}`);
    }
};

module.exports = { checkCscInPath, compileLauncher };
