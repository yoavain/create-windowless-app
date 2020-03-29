import chalk from "chalk";
import semverCompare from "semver-compare";
import fetch from "node-fetch";
import spawn from "cross-spawn";
import { SpawnSyncReturns } from "child_process";

export const checkNodeVersion = async (nodeVersion?: string): Promise<string> => {
    const windowsPrefix = "windows-x64";
    const windowsPrefixLength: number = windowsPrefix.length + 1;
    const options = {
        headers: {
            "User-Agent": "request"
        }
    };

    const result = await fetch("https://api.github.com/repos/nexe/nexe/releases/latest", options).then((res) => res.json());
    const assets = result && result.assets;

    let nexeNodeVersion: string;
    if (nodeVersion) {
        // Find exact
        const split = nodeVersion.split(".");
        const major: number = (split.length > 0 && (Number(split[0]) || 0)) || 0;
        const minor: number = (split.length > 1 && (Number(split[1]) || 0)) || 0;
        const patch: number = (split.length > 2 && (Number(split[2]) || 0)) || 0;
        const lookupVersion = `${windowsPrefix}-${major}.${minor}.${patch}`;

        const windowsVersion = assets && assets.find((asset) => asset.name === lookupVersion);
        if (windowsVersion && windowsVersion.name) {
            nexeNodeVersion = windowsVersion.name;
            console.log(`Found version ${chalk.green(nodeVersion)} in nexe`);
        }
        else {
            console.log(`Can't find node version ${chalk.red(nodeVersion)} in nexe. Looking for latest nexe release`);
        }
    }

    if (!nexeNodeVersion) {
        // Find latest
        const windowsVersions = assets && assets.filter((asset) => asset.name.startsWith(windowsPrefix)).map((asset) => asset.name);
        const latestWindowsVersion =
                windowsVersions &&
                windowsVersions.reduce((acc, cur) => {
                    const curSemVer: string = cur.substring(windowsPrefixLength);
                    const accSemVer: string = acc.substring(windowsPrefixLength);
                    acc = semverCompare(curSemVer, accSemVer) > 0 ? cur : acc;
                    return acc;
                }, `${windowsPrefix}-0.0.0`);

        console.log(`Using latest nexe release: ${latestWindowsVersion}`);
        nexeNodeVersion = latestWindowsVersion;
    }

    return nexeNodeVersion;
};

export const checkThatNpmCanReadCwd = (): boolean => {
    const cwd = process.cwd();
    let childOutput: string = null;
    try {
        const spawnResult: SpawnSyncReturns<string> = spawn.sync("npm", ["config", "list"]);
        if (spawnResult.status !== 0) {
            return false;
        }
        childOutput = spawnResult.output.join("");
    }
    catch (err) {
        return false;
    }

    const lines: string[] = childOutput.split("\n");
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = "; cwd = ";
    const line = lines.find((line) => line.indexOf(prefix) === 0);
    if (typeof line !== "string") {
        // Fail gracefully. They could remove it.
        return true;
    }
    const npmCWD = line.substring(prefix.length);
    if (npmCWD === cwd) {
        return true;
    }
    console.error(
        chalk.red(
            "Could not start an npm process in the right directory.\n\n" +
            `The current directory is: ${chalk.bold(cwd)}\n` +
            `However, a newly started npm process runs in: ${chalk.bold(npmCWD)}\n\n` +
            "This is probably caused by a misconfigured system terminal shell."
        )
    );
    if (process.platform === "win32") {
        console.error(
            chalk.red("On Windows, this can usually be fixed by running:\n\n") +
            `  ${chalk.cyan("reg")} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk.cyan("reg")} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk.red("Try to run the above two lines in the terminal.\n") +
            chalk.red("To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/")
        );
    }
    return false;
};