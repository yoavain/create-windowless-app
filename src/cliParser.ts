import commander from "commander";
import chalk from "chalk";
import { PACKAGE_JSON_FILENAME } from "~src/createWindowlessAppUtils";
import * as fs from "fs-extra";
import inquirer from "inquirer";
import type { InvalidNames, LegacyNames, ValidNames } from "validate-npm-package-name";
import validateProjectName from "validate-npm-package-name";
import semver from "semver";

const packageJson = require(`../${PACKAGE_JSON_FILENAME}`);

export type ParsedCommand = {
    projectName: string,
    command: commander.Command
}

export type ProgramConfig = {
    projectName: string;
    icon?: string;
    typescript: boolean;
    husky: boolean;
    skipInstall: boolean;
    nodeVersion: string;
    verbose: boolean;
};

function interactiveMode(): Promise<ProgramConfig> {
    return inquirer.prompt([
        {
            type: "input",
            message: "Project Name:",
            name: "projectName",
            validate: (value) => {
                const result: ValidNames | InvalidNames | LegacyNames = validateProjectName(value);
                return result.validForNewPackages || ((result as InvalidNames)?.errors?.[0]) || ((result as LegacyNames)?.warnings?.[0]) || "Invalid project name";
            }
        },
        {
            type: "input",
            message: "Icon:",
            name: "icon"
        },
        {
            type: "confirm",
            message: "TypeScript:",
            name: "typescript",
            default: true
        },
        {
            type: "confirm",
            message: "Install Husky:",
            name: "husky",
            default: true
        },
        {
            type: "confirm",
            message: "Skip NPM Install:",
            name: "skipInstall",
            default: false
        },
        {
            type: "input",
            message: "Node Version:",
            name: "nodeVersion",
            validate: (value) => !value || !!semver.valid(value) || "Invalid node version"
        },
        {
            type: "confirm",
            message: "Verbose:",
            name: "verbose",
            default: false
        }
    ]);
}

const validateInput = (programConfig: ProgramConfig, command: commander.Command): ProgramConfig => {
    const programConfigResult = { ...programConfig };
    if (!programConfigResult.projectName || typeof programConfigResult.projectName === "undefined") {
        console.error(`${chalk.red("Missing project name")}`);
        console.log();
        command.outputHelp();
        process.exit(1);
    }

    if (programConfigResult.icon && !fs.pathExistsSync(programConfigResult.icon)) {
        console.log(`Cannot find icon in ${chalk.red(programConfigResult.icon)}. Switching to ${chalk.green("default")} icon.`);
        programConfigResult.icon = undefined;
    }

    return programConfigResult;
};

export const parseCommand = async (argv: string[]): Promise<ProgramConfig> => {
    let projectName: string = undefined;
    const command: commander.Command = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments("<project-directory>")
        .usage(`${chalk.green("<project-directory>")} [options]`)
        .action((name) => {
            projectName = name;
        })
        .option("--verbose", "print additional logs")
        .option("--interactive", "interactive mode")
        .option("--no-typescript", "use javascript rather than typescript")
        .option("--no-husky", "do not install husky pre-commit hook for building launcher")
        .option("--skip-install", "write dependencies to package.json without installing")
        .option("--icon <icon>", "override default launcher icon file")
        .option("--node-version <nodeVersion>", "override node version to bundle")
        .allowUnknownOption()
        .on("--help", () => {
            console.log(`    Only ${chalk.green("<project-directory>")} is required.`);
            console.log();
            console.log("    If you have any problems, do not hesitate to file an issue:");
            console.log(`      ${chalk.cyan("https://github.com/yoavain/create-windowless-app/issues/new")}`);
            console.log();
        })
        .parse(argv);

    let programConfig: ProgramConfig;
    if (command.interactive) {
        programConfig = await interactiveMode();
    }
    else {
        programConfig = {
            projectName,
            verbose: command.verbose,
            typescript: command.typescript,
            husky: command.husky,
            skipInstall: command.skipInstall,
            icon: command.icon,
            nodeVersion: command.nodeVersion
        };
    }

    return validateInput(programConfig, command);
};
