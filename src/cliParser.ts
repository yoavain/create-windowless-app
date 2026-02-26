import chalk from "chalk";
import { parseArgs } from "util";
import { PACKAGE_JSON_FILENAME } from "./createWindowlessAppUtils";
import { existsSync } from "fs";
import { interactiveMode } from "./interactive";
import { validateProjectNameInput } from "./validation";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require(`../${PACKAGE_JSON_FILENAME}`);

export type ProgramConfig = {
    projectName: string;
    icon?: string;
    typescript: boolean;
    husky: boolean;
    verbose: boolean;
};

const HELP_TEXT = [
    "",
    "Usage: create-windowless-app [projectName] [options]",
    "",
    "Arguments:",
    "  projectName            project name",
    "",
    "Options:",
    "  -v, --verbose          print additional logs",
    "  -i, --interactive      interactive mode",
    "  -t, --typescript       use typescript (default: true)",
    "      --no-typescript    disable typescript",
    "  -h, --husky            install husky pre-commit hook (default: true)",
    "      --no-husky         disable husky",
    "  -c, --icon <file>      override default launcher icon file",
    "      --version          Show version number",
    "      --help             Show help",
    ""
].join("\n");

const exitWithHelp = (code: number, prefix?: string): void => {
    const output = prefix ? `${prefix}\n${HELP_TEXT}` : HELP_TEXT;
    process.stdout.write(output);
    process.exit(code);
};

export const parseCommand = async (argv: string[]): Promise<ProgramConfig> => {
    const args = argv.slice(2);

    let parsed;
    try {
        parsed = parseArgs({
            args,
            options: {
                "verbose":         { type: "boolean", short: "v" },
                "interactive":     { type: "boolean", short: "i" },
                "typescript":      { type: "boolean", short: "t", default: true },
                "no-typescript": { type: "boolean" },
                "husky":           { type: "boolean", short: "h", default: true },
                "no-husky":      { type: "boolean" },
                "icon":            { type: "string",  short: "c" },
                "help":            { type: "boolean" },
                "version":         { type: "boolean" }
            },
            allowPositionals: true,
            strict: true
        });
    }
    catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        exitWithHelp(1, `Error: ${message}\n`);
        return undefined as unknown as ProgramConfig;
    }

    const { values, positionals } = parsed;

    if (values.help) {
        exitWithHelp(0);
        return undefined as unknown as ProgramConfig;
    }

    if (values.version) {
        process.stdout.write(`${packageJson.version}\n`);
        process.exit(0);
        return undefined as unknown as ProgramConfig;
    }

    const projectName = positionals[0];
    const isInteractive = !!values.interactive;

    if (projectName && typeof validateProjectNameInput(projectName) === "string") {
        exitWithHelp(1, "Error: Invalid project name\n");
        return undefined as unknown as ProgramConfig;
    }

    if (!projectName && !isInteractive) {
        exitWithHelp(1, "Error: Missing project name\n");
        return undefined as unknown as ProgramConfig;
    }

    if (isInteractive) {
        return interactiveMode();
    }

    const typescript = !values["no-typescript"] && (values.typescript ?? true);
    const husky = !values["no-husky"] && (values.husky ?? true);

    let icon = values.icon;
    if (icon && !existsSync(icon)) {
        console.warn(`Cannot find icon in ${chalk.red(icon)}. Switching to ${chalk.green("default")} icon.`);
        icon = undefined;
    }

    return {
        projectName: projectName as string,
        verbose: values.verbose,
        typescript,
        husky,
        icon
    };
};
