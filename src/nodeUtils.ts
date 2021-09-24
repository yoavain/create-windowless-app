import chalk from "chalk";
import semverCompare from "semver-compare";
import spawn from "cross-spawn";
import type { SpawnSyncReturns } from "child_process";
import type { OptionsOfJSONResponseBody } from "got";
import got from "got";

type Release = {
    id: number
    node_id: string
    name: string
    content_type: string
    size: number
    download_count: number
    url: string
    browser_download_url: string
}

const WINDOWS_PREFIX = "windows-x64";

let releases: string[];
export const getWindowsReleases = async (): Promise<string[]> => {
    if (!releases) {
        const options: OptionsOfJSONResponseBody = {
            responseType: "json",
            headers: {
                "User-Agent": "request"
            }
        };
        const response = await got.get<{ assets: Array<Release> }>("https://api.github.com/repos/nexe/nexe/releases/latest", options);
        
        releases = response?.statusCode  === 200 && response.body?.assets.map((asset) => asset.name).filter((name) => name.startsWith(WINDOWS_PREFIX));
    }
    return releases;
};

export const checkNodeVersion = async (nodeVersion?: string): Promise<string> => {
    const windowsPrefixLength: number = WINDOWS_PREFIX.length + 1;
    const windowsVersions: string[] = await getWindowsReleases();

    let nexeNodeVersion: string;
    if (nodeVersion) {
        // Find exact
        const split: string[] = nodeVersion.split(".");
        const major: number = (split.length > 0 && (Number(split[0]) || 0)) || 0;
        const minor: number = (split.length > 1 && (Number(split[1]) || 0)) || 0;
        const patch: number = (split.length > 2 && (Number(split[2]) || 0)) || 0;
        const lookupVersion: string = `${WINDOWS_PREFIX}-${major}.${minor}.${patch}`;

        const windowsVersion: string = windowsVersions && windowsVersions.find((asset) => asset === lookupVersion);
        if (windowsVersion) {
            if (major <= 14) {
                nexeNodeVersion = windowsVersion;
                console.log(`Found version ${chalk.green(nodeVersion)} in nexe`);
            }
            else {
                console.log(`Version ${chalk.green(nodeVersion)} found in nexe, but known to have issues. Looking for latest working nexe release`);
            }
        }
        else {
            console.log(`Can't find node version ${chalk.red(nodeVersion)} in nexe. Looking for latest nexe release`);
        }
    }

    if (!nexeNodeVersion) {
        // Find latest
        const latestWindowsVersion =
                windowsVersions &&
                windowsVersions.reduce((acc, cur) => {
                    const curSemVer: string = cur.substring(windowsPrefixLength);
                    const accSemVer: string = acc.substring(windowsPrefixLength);
                    if (semverCompare(curSemVer, accSemVer) > 0 && semverCompare(curSemVer, "15.0.0") < 0) {
                        acc = cur;
                    }
                    return acc;
                }, `${WINDOWS_PREFIX}-0.0.0`);

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
