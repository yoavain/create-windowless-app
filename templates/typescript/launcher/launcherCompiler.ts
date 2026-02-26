import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";
import type { SpawnSyncReturns } from "child_process";

const COMPILER: string = "msbuild.exe";

export const checkMsbuildInPath = async (exit?: boolean): Promise<boolean> => {
    // Check for compiler in %PATH%
    const promises = (process.env.PATH ?? "").split(";").map((p) => fs.promises.access(path.resolve(p, COMPILER)).then(() => true, () => false));
    const results: boolean[] = await Promise.all(promises);
    const compilerFound: boolean = !!results.find((result) => !!result);

    if (exit && !compilerFound) {
        console.error(`You need "${COMPILER}" in your %PATH% in order to compile the launcher executable.`);
        process.exit(1);
    }
    else {
        return compilerFound;
    }
};

export const compileLauncher = async (): Promise<void> => {
    const args: string[] = ["./launcher/launcher.csproj"];

    const spawnResult: SpawnSyncReturns<Buffer> = spawnSync(COMPILER, args, { stdio: "inherit" });
    if (spawnResult.status !== 0) {
        return Promise.reject({ command: `${COMPILER} ${args.join(" ")}` });
    }
};
