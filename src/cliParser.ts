import chalk from "chalk";
import { PACKAGE_JSON_FILENAME } from "./createWindowlessAppUtils";
import { pathExistsSync } from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { interactiveMode } from "./interactive";
import { validateProjectNameInput } from "./validation";

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

const validateInput = (argv): any => {
    if (argv.icon && !pathExistsSync(argv.icon)) {
        console.log(`Cannot find icon in ${chalk.red(argv.icon)}. Switching to ${chalk.green("default")} icon.`);
        delete argv.icon;
    }

    return argv;
};

export const parseCommand = async (argv: string[]): Promise<ProgramConfig> => {
    const command: any = yargs(hideBin(argv))
        .command("* [projectName]", "project name",
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
        .check(({ projectName, interactive, help }) => {
            if (projectName && typeof validateProjectNameInput(projectName) === "string") {
                throw new Error("Invalid project name");
            }
            else if (!projectName && !interactive && !help) {
                throw new Error("Missing project name");
            }
            return true;
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
