import Enquirer from "enquirer";
import type { ProgramConfig } from "./cliParser";
import { validateProjectNameInput } from "./validation";

export const interactiveMode = (): Promise<ProgramConfig> => {
    return Enquirer.prompt<ProgramConfig>([
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
            initial: true
        },
        {
            type: "confirm",
            message: "Verbose:",
            name: "verbose",
            initial: false
        }
    ]);
};
