import chalk from "chalk";
import { PACKAGE_JSON_FILENAME } from "./createWindowlessAppUtils";
import { pathExistsSync } from "fs-extra";
import inquirer from "inquirer";
import type { InvalidNames, LegacyNames, ValidNames } from "validate-npm-package-name";
import validateProjectName from "validate-npm-package-name";
import semver from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const packageJson = require(`../${PACKAGE_JSON_FILENAME}`);

export type ProgramConfig = {
    projectName: string;
    icon?: string;
    typescript: boolean;
    husky: boolean;
    skipInstall: boolean;
    nodeVersion: string;
    verbose: boolean;
};

export const validateProjectNameInput = (value: string): string | boolean => {
    const result: ValidNames | InvalidNames | LegacyNames = validateProjectName(value);
    return result.validForNewPackages || ((result as InvalidNames)?.errors?.[0]) || ((result as LegacyNames)?.warnings?.[0]) || "Invalid project name";
};

export const validateNodeVersion = (value: string): string | boolean => {
    return !value || !!semver.valid(value) || "Invalid node version";
};

const interactiveMode = (): Promise<ProgramConfig> => {
    return inquirer.prompt([
        {
            type: "input",
            message: "Project Name:",
            name: "projectName",
            validate: validateProjectNameInput
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
            validate: validateNodeVersion
        },
        {
            type: "confirm",
            message: "Verbose:",
            name: "verbose",
            default: false
        }
    ]);
};

const validateInput = (argv): any => {
    if (argv.icon && !pathExistsSync(argv.icon)) {
        console.log(`Cannot find icon in ${chalk.red(argv.icon)}. Switching to ${chalk.green("default")} icon.`);
        delete argv.icon;
    }

    return argv;
};

export const parseCommand = async (argv: string[]): Promise<ProgramConfig> => {
    const command = yargs(hideBin(argv))
        .command("* <projectName>", "project name",
            (yargs) => {
                return yargs.positional("projectName", {
                    describe: "project name",
                    type: "string"
                });
            },
            () => {})
        .option("verbose", {
            alias: "v",
            type: "boolean",
            description: "print additional logs"
        })
        .option("interactive", {
            type: "boolean",
            alias: "i",
            description: "interactive mode"
        })
        .option("typescript", {
            alias: "t",
            type: "boolean",
            description: "use typescript",
            default: true
        })
        .option("husky", {
            alias: "h",
            type: "boolean",
            description: "install husky pre-commit hook for building launcher",
            default: true
        })
        .option("skip-install", {
            alias: "s",
            type: "boolean",
            description: "write dependencies to package.json without installing"
        })
        .option("icon", {
            alias: "c",
            type: "string",
            description: "override default launcher icon file"
        })
        .option("node-version", {
            alias: "n",
            type: "string",
            description: "override node version to bundle"
        })
        .version("version", packageJson.version)
        .help()
        .middleware(validateInput)
        .strict()
        .argv;

    let programConfig: ProgramConfig;
    if (command.interactive) {
        programConfig = await interactiveMode();
    }
    else {
        programConfig = {
            projectName : command.projectName,
            verbose: command.verbose,
            typescript: command.typescript,
            husky: command.husky,
            skipInstall: command["skip-install"],
            icon: command.icon,
            nodeVersion: command["node-version"]
        };
    }

    return programConfig;
};
