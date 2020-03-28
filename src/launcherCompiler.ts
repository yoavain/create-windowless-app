import * as fs from "fs-extra";
import * as path from "path";
import spawn from "cross-spawn";
import { ChildProcess } from "child_process";

export async function checkCscInPath(exit?: boolean): Promise<boolean> {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(";").map((p) => fs.pathExists(path.resolve(p, "csc.exe")));
    const results: boolean[] = await Promise.all(promises);
    const cscFound: boolean = results.find((result) => !!result);
    if (exit && !cscFound) {
        console.error("You need \"csc.exe\" (C# compiler) in your path in order to compile the launcher.exe.");
        process.exit(1);
    }
    else {
        return cscFound;
    }
}

export function compileLauncher(sourceLocation: string, outputLocation: string, iconLocation: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = "csc.exe";
        const args: string[] = ["/t:winexe", `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];
        const child: ChildProcess = spawn(command, args, { stdio: "inherit" });
        child.on("close", (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(" ")}`
                });
                return;
            }
            resolve();
        });
    });
}
