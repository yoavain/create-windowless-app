import { checkMsbuildInPath } from "./launcherCompiler";
import { createWindowlessApp } from "./createWindowlessApp";

export const main = async () => {
    const currentNodeVersion: string = process.versions.node;
    const semver: string[] = currentNodeVersion.split(".");
    const major: number = Number(semver[0]);
    const minor: number = Number(semver[1]);

    if (isNaN(major) || isNaN(minor) || major < 12 || (major === 12 && minor < 20)) {
        console.error(`You are running NodeJS ${currentNodeVersion}.\nCreate Windowless App requires NodeJS 12.20 or higher.\nPlease update your version of Node.`);
        process.exit(1);
    }

    // Check for msbuild.exe in %PATH%
    await checkMsbuildInPath(true);

    await createWindowlessApp(process.argv);
};
