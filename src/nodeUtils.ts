import chalk from "chalk";
import semverCompare from "semver-compare";
import request from "request";

export const checkNodeVersion = (nodeVersion?: string): Promise<string> => {
    return new Promise<string>((resolve) => {
        const windowsPrefix = "windows-x64";
        const windowsPrefixLength: number = windowsPrefix.length + 1;
        const options = {
            headers: {
                "User-Agent": "request"
            }
        };
        request.get("https://api.github.com/repos/nexe/nexe/releases/latest", options, (error, response, body) => {
            const result = body && JSON.parse(body);
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

            resolve(nexeNodeVersion);
        });
    });
};