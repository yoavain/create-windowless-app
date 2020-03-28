import * as fs from "fs-extra";
import * as path from "path";
import spawn from "cross-spawn";
import type { SpawnSyncReturns } from "child_process";

export const checkCscInPath = async (exit?: boolean): Promise<boolean> => {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(";").map((p) => fs.pathExists(path.resolve(p, "csc.exe")));
    const results: boolean[] = await Promise.all(promises);
    const cscFound: boolean = await results.find((result) => !!result);

    if (exit && !cscFound) {
        console.error("You need \"csc.exe\" (C# compiler) in your path in order to compile the launcher.exe.");
        process.exit(1);
    }
    else {
        return cscFound;
    }
};

export const compileLauncher = async (sourceLocation: string, outputLocation: string, iconLocation: string): Promise<void> => {
    const command = "csc.exe";
    const args: string[] = ["/t:winexe", `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];

    const spawnResult: SpawnSyncReturns<Buffer> = spawn.sync(command, args, { stdio: "inherit" });
    if (spawnResult.status !== 0) {
        return Promise.reject({ command: `${command} ${args.join(" ")}` });
    }
};
