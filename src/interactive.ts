import inquirer from "inquirer";
import type { ProgramConfig } from "./cliParser";
import { validateProjectNameInput } from "./validation";

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
            message: "Verbose:",
            name: "verbose",
            default: false
        }
    ]);
};