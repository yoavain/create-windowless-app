import chalk from "chalk";
import * as path from "path";
import { ensureDirSync, readdirSync, removeSync } from "fs-extra";
import spawn from "cross-spawn";
import { compileLauncher } from "./launcherCompiler";
import { consts } from "./consts";
import { checkAppName, getSingleExecutableApplicationsScripts, isSafeToCreateProjectIn, mergeIntoPackageJson, replaceAppNamePlaceholder } from "./createWindowlessAppUtils";
import { copyFile, readJsonResource, readResource, writeFile, writeJson } from "./fileUtils";
import { checkThatNpmCanReadCwd } from "./nodeUtils";
import type { ProgramConfig } from "./cliParser";
import { parseCommand } from "./cliParser";

// TypeScript
const tsWebpackConfigResourceLocation = "../templates/typescript/webpack.config.ts";
const tsConfigBuildResourceLocation = "../templates/typescript/tsconfig.build.json";
const tsConfigResourceLocation = "../templates/typescript/tsconfig.json";
const tsIndexResourceLocation = "../templates/typescript/src/index.ts";
const tsLauncherCompilerLocation = "../templates/typescript/launcher/launcherCompiler.ts";
const tsCheckNodeVersionLocation = "../templates/typescript/utils/checkNodeVersion.ts";

// JavaScript
const jsWebpackConfigResourceLocation = "../templates/javascript/webpack.config.js";
const jsIndexResourceLocation = "../templates/javascript/src/index.js";
const jsLauncherCompilerLocation = "../templates/javascript/launcher/launcherCompiler.js";
const jsCheckNodeVersionLocation = "../templates/javascript/utils/checkNodeVersion.js";

// Launcher Source
const launcherSrcResourceLocation = "../templates/common/src/launcher.cs";
const launcherSrcModifiedLocation = "launcher/launcher.cs";
const launcherProjResourceLocation = "../templates/common/launcher.csproj";
const launcherProjModifiedLocation = "launcher/launcher.csproj";

// Single executable applications config
const seaConfigResourceLocation = "../templates/common/sea-config.json";

// Default icon location
const defaultLauncherIconLocation = "../templates/common/resources/windows-launcher.ico";

// Husky config file
const huskyConfigFileLocation = "../templates/common/husky/pre-commit";


const install = async (root: string, dependencies: string[], isDev: boolean, programConfig: ProgramConfig): Promise<void> => {
    const { verbose, skipInstall } = programConfig;

    if (!skipInstall) {
        const command = "npm";
        const args = ["install", isDev ? "--save-dev" : "--save", "--save-exact", "--loglevel", "error"].concat(dependencies);
        if (verbose) {
            args.push("--verbose");
        }
        console.log(`Installing ${chalk.green(isDev ? "dev dependencies" : "dependencies")}.`);
        console.log();

        spawn.sync(command, args, { stdio: "inherit" });
    }
    else {
        console.log(`Adding ${chalk.green(isDev ? "dev dependencies" : "dependencies")} to package.json (skipping installation)`);
        console.log();

        const dependenciesObject = dependencies.reduce<Record<string, string>>((acc, dep) => {
            let depName: string = dep;
            let depVersion: string = "^x.x.x";
            if (dep.lastIndexOf("@") > 0) {
                depName = dep.substring(0, dep.lastIndexOf("@"));
                const depVersionString: string[] = dep.substring(dep.lastIndexOf("@")).split(".");
                depVersion = `^${depVersionString?.[0] ?? "x"}.${depVersionString?.[1] ?? "x"}.${depVersionString?.[2] ?? "x"}`;
            }
            acc[depName] = depVersion;
            return acc;
        }, {});
        mergeIntoPackageJson(root, isDev ? "devDependencies" : "dependencies", dependenciesObject);
    }
};

const buildTypeScriptProject = (root: string, appName: string, husky: boolean): void => {
    console.log(`Building project ${chalk.green("files")}.`);
    console.log();

    writeJson(path.resolve(root, "tsconfig.build.json"), readJsonResource(tsConfigBuildResourceLocation));
    writeJson(path.resolve(root, "tsconfig.json"), readJsonResource(tsConfigResourceLocation));
    writeFile(path.resolve(root, "webpack.config.ts"), replaceAppNamePlaceholder(readResource(tsWebpackConfigResourceLocation), appName));
    ensureDirSync(path.resolve(root, "src"));
    writeFile(path.resolve(root, "src", "index.ts"), replaceAppNamePlaceholder(readResource(tsIndexResourceLocation), appName));
    ensureDirSync(path.resolve(root, "utils"));
    writeFile(path.resolve(root, "utils", "checkNodeVersion.ts"), readResource(tsCheckNodeVersionLocation));

    // Add scripts
    const scripts: Record<string, string> = {
        "start": "ts-node src/index.ts",
        "type-check": "tsc --build tsconfig.json",
        "prewebpack": "rimraf build && rimraf dist",
        "webpack": "webpack",
        "prebuild": "npm run check-node-version",
        "build": "npm run type-check && npm run webpack && npm run node-sea",
        "check-node-version": "ts-node -e \"require(\"\"./utils/checkNodeVersion\"\").checkNodeRuntimeVersion()\"",
        "check-msbuild": "ts-node -e \"require(\"\"./launcher/launcherCompiler\"\").checkMsbuildInPath(true)\"",
        "rebuild-launcher": "msbuild launcher/launcher.csproj",
        ...getSingleExecutableApplicationsScripts(appName)
    };

    // Add husky
    if (husky) {
        scripts["prepare"] = "git config --get core.hookspath || husky install";
        scripts["pre-commit"] = `git diff HEAD --exit-code --stat launcher/* || npm run check-msbuild && npm run rebuild-launcher && git add resources/bin/${appName}-launcher.exe`;

        ensureDirSync(path.resolve(root, ".husky"));
        writeFile(path.resolve(root, ".husky", "pre-commit"), readResource(huskyConfigFileLocation));
    }

    mergeIntoPackageJson(root, "scripts", scripts);
};

const buildJavaScriptProject = (root: string, appName: string, husky: boolean): void => {
    console.log(`Building project ${chalk.green("files")}.`);
    console.log();

    writeFile(path.resolve(root, "webpack.config.js"), replaceAppNamePlaceholder(readResource(jsWebpackConfigResourceLocation), appName));
    ensureDirSync(path.resolve(root, "src"));
    writeFile(path.resolve(root, "src", "index.js"), replaceAppNamePlaceholder(readResource(jsIndexResourceLocation), appName));
    ensureDirSync(path.resolve(root, "utils"));
    writeFile(path.resolve(root, "utils", "checkNodeVersion.js"), readResource(jsCheckNodeVersionLocation));

    // Add scripts
    const scripts: Record<string, string> = {
        "start": "node src/index.js",
        "prewebpack": "rimraf build && rimraf dist",
        "webpack": "webpack",
        "prebuild": "npm run check-node-version",
        "build": "npm run webpack && npm run node-sea",
        "check-node-version": "node -e \"require(\"\"./utils/checkNodeVersion\"\").checkNodeRuntimeVersion()\"",
        "check-msbuild": "node -e \"require(\"\"./launcher/launcherCompiler\"\").checkMsbuildInPath(true)\"",
        "rebuild-launcher": "msbuild launcher/launcher.csproj",
        ...getSingleExecutableApplicationsScripts(appName)
    };

    // Add husky
    if (husky) {
        scripts["prepare"] = "git config --get core.hookspath || husky install";
        scripts["pre-commit"] = `git diff HEAD --exit-code --stat launcher/* || npm run check-msbuild && npm run rebuild-launcher && git add resources/bin/${appName}-launcher.exe`;

        ensureDirSync(path.resolve(root, ".husky"));
        writeFile(path.resolve(root, ".husky", "pre-commit"), readResource(huskyConfigFileLocation));
    }

    mergeIntoPackageJson(root, "scripts", scripts);
};

export const buildLauncher = (root: string, appName: string, icon: string, typescript: boolean): Promise<void> => {
    console.log(`Building project ${chalk.green("launcher")}.`);
    console.log();

    ensureDirSync(path.resolve("launcher"));
    writeFile(path.resolve(launcherSrcModifiedLocation), replaceAppNamePlaceholder(readResource(launcherSrcResourceLocation), appName));
    writeFile(path.resolve(launcherProjModifiedLocation), replaceAppNamePlaceholder(readResource(launcherProjResourceLocation), appName));
    if (typescript) {
        copyFile(path.resolve(__dirname, tsLauncherCompilerLocation), path.resolve(root, "launcher", "launcherCompiler.ts"));
    }
    else {
        copyFile(path.resolve(__dirname, jsLauncherCompilerLocation), path.resolve(root, "launcher", "launcherCompiler.js"));
    }

    // Resolve icon
    let iconLocation: string;
    if (icon) {
        iconLocation = path.resolve(icon);
        console.log(`Building launcher with icon: ${chalk.green(icon)}.`);
    }
    else {
        iconLocation = path.resolve(__dirname, defaultLauncherIconLocation);
        console.log(`Building launcher with ${chalk.green("default")} icon.`);
    }
    copyFile(iconLocation, path.resolve(root, "launcher", "launcher.ico"));

    return compileLauncher();
};

const run = async (root: string, appName: string, originalDirectory: string, programConfig: ProgramConfig): Promise<void> => {
    const { typescript, husky, icon } = programConfig;
    const dependencies = [...consts.dependencies];
    const devDependencies = [...consts.devDependencies];
    if (typescript) {
        devDependencies.push(...consts.tsDevDependencies);
    }
    if (husky) {
        devDependencies.push(...consts.huskyDependencies);
    }

    try {
        await install(root, dependencies, false, programConfig);
        await install(root, devDependencies, true, programConfig);
        if (typescript) {
            buildTypeScriptProject(root, appName, husky);
        }
        else {
            buildJavaScriptProject(root, appName, husky);
        }

        // Launcher
        ensureDirSync(path.resolve(root, "resources", "bin"));
        await buildLauncher(root, appName, icon, typescript);

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

const createApp = (programConfig: ProgramConfig): Promise<void> => {
    const { projectName } = programConfig;
    const root: string = path.resolve(projectName);
    const appName: string = path.basename(root);

    checkAppName(appName);
    ensureDirSync(projectName);
    if (!isSafeToCreateProjectIn(root, projectName)) {
        process.exit(1);
    }

    console.log(`Creating a new windowless app in ${chalk.green(root)}.`);
    console.log();

    const packageJson = {
        name: appName,
        version: "0.1.0",
        private: true,
        main: "_build/index.js"
    };
    writeJson(path.join(root, "package.json"), packageJson);
    copyFile(path.resolve(__dirname, seaConfigResourceLocation), path.resolve(root, "sea-config.json"));

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    return run(root, appName, originalDirectory, programConfig);
};

export const createWindowlessApp = async (argv: string[]): Promise<void> => {
    const programConfig: ProgramConfig = await parseCommand(argv);

    if (programConfig.projectName) {
        return createApp(programConfig);
    }
};
