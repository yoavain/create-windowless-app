import inquirer from "inquirer";
import type { ProgramConfig } from "./cliParser";
import { validateNodeVersion, validateProjectNameInput } from "./validation";

export const interactiveMode = (): Promise<ProgramConfig> => {
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