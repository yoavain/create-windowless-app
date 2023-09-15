import chalk from "chalk";
import spawn from "cross-spawn";
import type { SpawnSyncReturns } from "child_process";

export const checkThatNpmCanReadCwd = (): boolean => {
    const cwd = process.cwd();
    let childOutput: string = null;
    try {
        const spawnResult: SpawnSyncReturns<Buffer> = spawn.sync("npm", ["config", "list"]);
        if (spawnResult.status !== 0) {
            return false;
        }
        childOutput = spawnResult.output.toString();
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
