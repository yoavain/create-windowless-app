import commander from "commander";
import chalk from "chalk";
import { PACKAGE_JSON_FILENAME } from "./createWindowlessAppUtils";

const packageJson = require(`../${PACKAGE_JSON_FILENAME}`);

export type ParsedCommand = {
    projectName: string,
    command: commander.Command
}

export const parseCommand = (argv: string[]): ParsedCommand => {
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
    return { projectName, command };
};
