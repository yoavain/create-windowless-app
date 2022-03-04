import { checkMsbuildInPath } from "./launcherCompiler";
import { createWindowlessApp } from "./createWindowlessApp";

export const main = async () => {
    const currentNodeVersion: string = process.versions.node;
    const semver: string[] = currentNodeVersion.split(".");
    const major = Number(semver[0]);

    if (Number.isNaN(major) || major < 10) {
        console.error(`You are running Node ${currentNodeVersion}.\nCreate Windowless App requires Node 12 or higher.\nPlease update your version of Node.`);
        process.exit(1);
    }

    // Check for msbuild.exe in %PATH%
    await checkMsbuildInPath(true);

    await createWindowlessApp(process.argv);
};
