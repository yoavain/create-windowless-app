import chalk from "chalk";
import * as path from "path";
import * as fs from "fs";
import { compileLauncher } from "./launcherCompiler";
import { consts } from "./consts";
import { checkAppName, deleteFilesInDir, isSafeToCreateProjectIn } from "./createWindowlessAppUtils";
import { checkThatNpmCanReadCwd } from "./nodeUtils";
import type { ProgramConfig } from "./cliParser";
import { parseCommand } from "./cliParser";
import { PackageJsonBuilder } from "./packageJson";
import { DependenciesManager } from "./dependencies";
import { FileManager, writeJson } from "./files";

const handleInstallError = (reason: unknown, root: string, appName: string): never => {
    console.log();
    console.log("Aborting installation.");
    if ((reason as { command?: string }).command) {
        console.log(`  ${chalk.cyan((reason as { command: string }).command)} has failed.`);
    }
    else {
        console.log(chalk.red("Unexpected error. Please report it as a bug:"));
        console.log(reason);
    }
    console.log();

    // On 'exit' we will delete these files from target directory.
    deleteFilesInDir(
        root,
        (file) => consts.knownGeneratedFiles.includes(file),
        (file) => console.log(`Deleting generated file... ${chalk.cyan(file)}`)
    );
    const remainingFiles = fs.readdirSync(path.join(root));
    if (!remainingFiles.length) {
        // Delete target folder if empty
        console.log(`Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(path.resolve(root, ".."))}`);
        process.chdir(path.resolve(root, ".."));
        fs.rmSync(path.join(root), { recursive: true, force: true });
    }
    console.log("Done (with errors).");
    process.exit(1);
};

const run = async (root: string, appName: string, originalDirectory: string, programConfig: ProgramConfig): Promise<void> => {
    const { typescript, husky, icon, verbose } = programConfig;

    try {
        const dependenciesManager: DependenciesManager = new DependenciesManager(typescript, husky);
        await dependenciesManager.installAll(verbose);

        const fileManager: FileManager = new FileManager({ targetRoot: root, appName, typeScript: typescript, husky, icon });
        await fileManager.copyTemplate();

        // Launcher
        fs.mkdirSync(path.resolve(root, "resources", "bin"), { recursive: true });
        await compileLauncher();

        console.log("Done");
    }
    catch (reason: unknown) {
        handleInstallError(reason, root, appName);
    }
};

const createApp = async (programConfig: ProgramConfig): Promise<void> => {
    const { projectName, typescript, husky } = programConfig;
    const root: string = path.resolve(projectName);
    const appName: string = path.basename(root);

    checkAppName(appName);
    fs.mkdirSync(projectName, { recursive: true });
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

    if (programConfig?.projectName) {
        return createApp(programConfig);
    }
};
