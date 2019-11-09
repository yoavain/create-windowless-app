import * as fs from 'fs-extra';
import * as path from 'path';
import spawn from 'cross-spawn';
import { ChildProcess } from 'child_process';

export function checkCscInPath(exit?: boolean): Promise<boolean> {
    // Check for csc.exe in %PATH%
    const promises = process.env.path.split(';').map((p) => fs.pathExists(path.resolve(p, 'csc.exe')));
    return Promise.all(promises)
        .then((results) => {
            return results.find((result) => !!result);
        })
        .then((result) => {
            if (exit && !result) {
                console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
                process.exit(1);
            } else {
                return !!result;
            }
        });
}

export function compileLauncher(sourceLocation: string, outputLocation: string, iconLocation: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command: string = 'csc.exe';
        const args: string[] = ['/t:winexe', `/out:${outputLocation}`, `/win32icon:${iconLocation}`, `${sourceLocation}`];
        const child: ChildProcess = spawn(command, args, { stdio: 'inherit' });
        child.on('close', (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`
                });
                return;
            }
            resolve();
        });
    });
}
