import { checkNodeRuntimeVersion } from "./checkNodeVersion";
import { checkMsbuildInPath } from "./launcherCompiler";
import { createWindowlessApp } from "./createWindowlessApp";

export const main = async () => {
    // check minimum node version
    checkNodeRuntimeVersion();

    // Check for msbuild.exe in %PATH%
    await checkMsbuildInPath(true);

    await createWindowlessApp(process.argv);
};
