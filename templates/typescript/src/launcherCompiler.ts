import * as fs from "fs-extra";
import * as path from "path";
import spawn from "cross-spawn";
import { ChildProcess } from "child_process";

export function checkCscInPath(): Promise<boolean> {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(";").map(p => fs.pathExists(path.resolve(p, "csc.exe")));
    return Promise.all(promises)
        .then(results => {
            return results.find(result => !!result);
        });
}

export function compileLauncher(sourceLocation: string, iconLocation: string, outputLocation: string): Promise<void> {
    return new Promise(((resolve, reject) => {
        const command: string = 'csc.exe';
        const args: string[] = ["/t:winexe", `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];
        const child: ChildProcess = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    }))
}
