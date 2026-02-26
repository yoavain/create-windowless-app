const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const COMPILER = "msbuild.exe";

const checkMsbuildInPath = async (exit) => {
    // Check for compiler in %PATH%
    const promises = (process.env.PATH ?? "").split(";").map((p) => fs.promises.access(path.resolve(p, COMPILER)).then(() => true, () => false));
    const results = await Promise.all(promises);
    const compilerFound = !!results.find((result) => !!result);

    if (exit && !compilerFound) {
        console.error(`You need "${COMPILER}" in your %PATH% in order to compile the launcher executable.`);
        process.exit(1);
    }
    else {
        return compilerFound;
    }
};

const compileLauncher = async () => {
    const args = ["./launcher/launcher.csproj"];

    const spawnResult = spawnSync(COMPILER, args, { stdio: "inherit" });
    if (spawnResult.status !== 0) {
        return Promise.reject({ command: `${COMPILER} ${args.join(" ")}` });
    }
};

module.exports = { checkMsbuildInPath, compileLauncher };
