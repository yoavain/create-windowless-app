import chalk from "chalk";
import * as path from "path";
import { ensureDirSync, readdirSync, removeSync } from "fs-extra";
import { compileLauncher } from "./launcherCompiler";
import { consts } from "./consts";
import { checkAppName, isSafeToCreateProjectIn } from "./createWindowlessAppUtils";
import { checkThatNpmCanReadCwd } from "./nodeUtils";
import type { ProgramConfig } from "./cliParser";
import { parseCommand } from "./cliParser";
import { PackageJsonBuilder } from "./packageJson";
import { DependenciesManager } from "./dependencies";
import { FileManager, writeJson } from "./files";

const run = async (root: string, appName: string, originalDirectory: string, programConfig: ProgramConfig): Promise<void> => {
    const { typescript, husky, icon, verbose } = programConfig;

    try {
        const dependenciesManager: DependenciesManager = new DependenciesManager(typescript, husky);
        await dependenciesManager.install(verbose);

        const fileManager: FileManager = new FileManager(root, appName, typescript, husky, icon);
        await fileManager.copyTemplate();

        // Launcher
        ensureDirSync(path.resolve(root, "resources", "bin"));
        await compileLauncher();

        console.log("Done");
    }
    catch (reason) {
        console.log();
        console.log("Aborting installation.");
        if (reason.command) {
            console.log(`  ${chalk.cyan(reason.command)} has failed.`);
        }
        else {
            console.log(chalk.red("Unexpected error. Please report it as a bug:"));
            console.log(reason);
        }
        console.log();

        // On 'exit' we will delete these files from target directory.
        const knownGeneratedFiles = [...consts.knownGeneratedFiles];
        const currentFiles = readdirSync(path.join(root));
        currentFiles.forEach((file) => {
            knownGeneratedFiles.forEach((fileToMatch) => {
                // This removes all knownGeneratedFiles.
                if (file === fileToMatch) {
                    console.log(`Deleting generated file... ${chalk.cyan(file)}`);
                    removeSync(path.join(root, file));
                }
            });
        });
        const remainingFiles = readdirSync(path.join(root));
        if (!remainingFiles.length) {
            // Delete target folder if empty
            console.log(`Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(path.resolve(root, ".."))}`);
            process.chdir(path.resolve(root, ".."));
            removeSync(path.join(root));
        }
        console.log("Done (with errors).");
        process.exit(1);
    }
};

const createApp = async (programConfig: ProgramConfig): Promise<void> => {
    const { projectName, typescript, husky } = programConfig;
    const root: string = path.resolve(projectName);
    const appName: string = path.basename(root);

    checkAppName(appName);
    ensureDirSync(projectName);
    if (!isSafeToCreateProjectIn(root, projectName)) {
        process.exit(1);
    }

    console.log(`Creating a new windowless app in ${chalk.green(root)}.`);
    console.log();

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.chdir(originalDirectory);
        process.exit(1);
    }

    try {
        // package.json
        const packageJson = new PackageJsonBuilder(appName);
        if (!typescript) {
            packageJson.withJavaScript();
        }
        if (husky) {
            packageJson.withHusky();
        }
        writeJson(path.join(root, "package.json"), packageJson.build());

        await run(root, appName, originalDirectory, programConfig);
    }
    finally {
        process.chdir(originalDirectory);
    }
};

export const createWindowlessApp = async (argv: string[]): Promise<void> => {
    const programConfig: ProgramConfig = await parseCommand(argv);

    if (programConfig.projectName) {
        return createApp(programConfig);
    }
};
