import * as commander from "commander";
import { Command } from "commander";
import chalk from "chalk";
import * as envinfo from "envinfo";
import * as path from "path";
import * as fs from "fs-extra";
import validateProjectName from 'validate-npm-package-name';
import * as os from "os";
import spawn from "cross-spawn";
import semver from "semver";
import semverCompare from "semver-compare";
import inquirer from "inquirer";
import { compileLauncher } from "../templates/typescript/launcher/launcherCompiler";
import request = require("request");

const packageJsonFilename = "package.json";
const packageJson = require(`../${packageJsonFilename}`);

const consts = require('../resources/consts.json');
const tsConfigFilename = "tsconfig.json";
const WebpackConfigFilename = "webpack.config.js";

// TypeScript
const tsWebpackConfigResourceLocation = `../templates/typescript/${WebpackConfigFilename}`;
const tsConfigResourceLocation = `../templates/typescript/${tsConfigFilename}`;
const tsIndexResourceLocation = "../templates/typescript/src/index.ts";
const tsLauncherCompilerLocation = "../templates/typescript/launcher/launcherCompiler.ts";

// JavaScript
const jsWebpackConfigResourceLocation = `../templates/javascript/${WebpackConfigFilename}`;
const jsIndexResourceLocation = "../templates/javascript/src/index.js";
const jsLauncherCompilerLocation = "../templates/javascript/launcher/launcherCompiler.js";

// Launcher Source
const launcherSrcResourceLocation = "../templates/common/src/launcher.cs";
const launcherSrcModifiedLocation = "launcher/launcher.cs";

// Default icon location
const defaultLauncherIconLocation = "../templates/common/resources/windows-launcher.ico";

// These files should be allowed to remain on a failed install, but then silently removed during the next create.
const errorLogFilePatterns = consts.errorLogFilePatterns;

type ProgramConfig = {
    projectName: string
    icon?: string
    typescript: boolean
    skipInstall: boolean
    nodeVersion: string
    verbose: boolean
}

function interactiveMode(): Promise<ProgramConfig> {
    return inquirer.prompt([
        {
            type: "input",
            message: "Project Name:",
            name: "projectName",
            validate: value => {
                let result = validateProjectName(value);
                return result.validForNewPackages ||
                    (validateProjectName(value).errors && validateProjectName(value).errors[0]) ||
                    (validateProjectName(value).warnings && validateProjectName(value).warnings[0]) ||
                    "Invalid project name";
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
            message: "Skip Install:",
            name: "skipInstall",
            default: false
        },
        {
            type: "input",
            message: "Node Version:",
            name: "nodeVersion",
            validate: value => !value || !!semver.valid(value) || "Invalid node version"
        },
        {
            type: "confirm",
            message: "Verbose:",
            name: "verbose",
            default: false
        }
    ]);
}

function validateInput(programConfig: ProgramConfig, program: Command) {
    if (!programConfig.projectName || typeof programConfig.projectName === 'undefined') {
        console.error(`${chalk.red('Missing project name')}`);
        console.log();
        program.outputHelp();
        process.exit(1);
    }

    if (programConfig.icon && !fs.pathExistsSync(programConfig.icon)) {
        console.log(`Cannot find icon in ${chalk.red(programConfig.icon)}. Switching to ${chalk.green("default")} icon.`);
        programConfig.icon = undefined;
    }
}

export async function createWindowlessApp(): Promise<void> {
    let projectName: string = undefined;

    const program: Command = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments('<project-directory>')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => {
            projectName = name;
        })
        .option('--verbose', 'print additional logs')
        .option('--info', 'print environment debug info')
        .option('--interactive', 'interactive mode')
        .option('--typescript')
        .option('--skip-install', 'write dependencies to package.json without installing')
        .option('--icon <icon>', 'override default launcher icon file')
        .option('--node-version <nodeVersion>', 'override node version to bundle')
        .allowUnknownOption()
        .on('--help', () => {
            console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
            console.log();
            console.log(`    If you have any problems, do not hesitate to file an issue:`);
            console.log(`      ${chalk.cyan('https://github.com/yoavain/create-windowless-app/issues/new')}`);
            console.log();
        })
        .parse(process.argv);

    if (program.info) {
        console.log(chalk.bold('\nEnvironment Info:'));
        return envinfo
            .run({
                    System: ['OS', 'CPU'],
                    Binaries: ['Node', 'npm'],
                    npmPackages: [...consts.dependencies, ...consts.devDependencies, ...consts.tsDevDependencies],
                    npmGlobalPackages: ['create-windowless-app'],
                },
                {
                    duplicates: true,
                    showNotFound: true,
                }
            )
            .then(console.log);
    }

    let programConfig: ProgramConfig;
    if (program.interactive) {
        programConfig = await interactiveMode();
    }
    else {
        programConfig = {
            projectName,
            verbose: program.verbose,
            typescript: program.typescript,
            skipInstall: program.skipInstall,
            icon: program.icon,
            nodeVersion: program.nodeVersion
        };
    }

    validateInput(programConfig, program);

    return createApp(programConfig);
}

function createApp(programConfig: ProgramConfig) {
    const { projectName } = programConfig;
    const root = path.resolve(projectName);
    const appName = path.basename(root);

    checkAppName(appName);
    fs.ensureDirSync(projectName);
    if (!isSafeToCreateProjectIn(root, projectName)) {
        process.exit(1);
    }

    console.log(`Creating a new windowless app in ${chalk.green(root)}.`);
    console.log();

    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
        main: "_build/index.js"
    };
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    return run(root, appName, originalDirectory, programConfig);
}

function run(root: string, appName: string, originalDirectory: string, programConfig: ProgramConfig): Promise<void> {
    const { typescript, icon, nodeVersion } = programConfig;
    const dependencies = [...consts.dependencies];
    const devDependencies = [...consts.devDependencies];
    if (typescript) {
        devDependencies.push(...consts.tsDevDependencies);
    }

    return install(root, dependencies, false, programConfig)
        .then(() => {
            return install(root, devDependencies, true, programConfig);
        })
        .then(() => {
            return checkNodeVersion(nodeVersion);
        })
        .then((checkedNodeVersion: string) => {
            if (typescript) {
                return buildTypeScriptProject(root, appName, checkedNodeVersion);
            }
            else {
                return buildJavaScriptProject(root, appName, checkedNodeVersion);
            }
        })
        .then(() => {
            // Launcher
            fs.ensureDirSync(path.resolve(root, "resources", "bin"));
            return buildLauncher(root, appName, icon, typescript);
        })
        .then(() => console.log("Done"))
        .catch(reason => {
            console.log();
            console.log('Aborting installation.');
            if (reason.command) {
                console.log(`  ${chalk.cyan(reason.command)} has failed.`);
            }
            else {
                console.log(
                    chalk.red('Unexpected error. Please report it as a bug:')
                );
                console.log(reason);
            }
            console.log();

            // On 'exit' we will delete these files from target directory.
            const knownGeneratedFiles = [...consts.knownGeneratedFiles];
            const currentFiles = fs.readdirSync(path.join(root));
            currentFiles.forEach(file => {
                knownGeneratedFiles.forEach(fileToMatch => {
                    // This removes all knownGeneratedFiles.
                    if (file === fileToMatch) {
                        console.log(`Deleting generated file... ${chalk.cyan(file)}`);
                        fs.removeSync(path.join(root, file));
                    }
                });
            });
            const remainingFiles = fs.readdirSync(path.join(root));
            if (!remainingFiles.length) {
                // Delete target folder if empty
                console.log(`Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(path.resolve(root, '..'))}`);
                process.chdir(path.resolve(root, '..'));
                fs.removeSync(path.join(root));
            }
            console.log('Done (with errors).');
            process.exit(1);
        });
}

function install(root: string, dependencies: string[], isDev: boolean, programConfig: ProgramConfig): Promise<void> {
    const { verbose, skipInstall } = programConfig;
    return new Promise((resolve, reject) => {
        const command = 'npm';
        let args = ['install', isDev ? '--save-dev' : '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);
        if (verbose) {
            args.push('--verbose');
        }

        if (!skipInstall) {
            console.log(`Installing ${chalk.green(isDev ? "dev dependencies" : "dependencies")}.`);
            console.log();

            const child = spawn(command, args, { stdio: 'inherit' });
            child.on('close', code => {
                if (code !== 0) {
                    reject({
                        command: `${command} ${args.join(' ')}`,
                    });
                    return;
                }
                resolve();
            });
        }
        else {
            console.log(`Adding ${chalk.green(isDev ? "dev dependencies" : "dependencies")} to package.json (skipping installation)`);
            console.log();

            const dependenciesObject = dependencies.reduce((acc, cur) => {
                acc[cur] = "^x.x.x";
                return acc
            }, {});
            mergeIntoPackageJson(root, isDev ? "devDependencies" : "dependencies", dependenciesObject);
            resolve();
        }
    });
}

function buildTypeScriptProject(root: string, appName: string, nodeVersion: string) {
    return new Promise((resolve, reject) => {
        console.log(`Building project ${chalk.green("files")}.`);
        console.log();

        writeJson(path.resolve(root, tsConfigFilename), readJsonResource(tsConfigResourceLocation));
        writeFile(path.resolve(root, WebpackConfigFilename), replaceAppNamePlaceholder(readResource(tsWebpackConfigResourceLocation), appName));
        fs.ensureDirSync(path.resolve(root, "src"));
        writeFile(path.resolve(root, "src", "index.ts"), replaceAppNamePlaceholder(readResource(tsIndexResourceLocation), appName));

        // Add scripts
        const scripts: { [key: string]: string } = {
            "start": "ts-node src/index.ts",
            "tsc": "tsc",
            "webpack": "webpack",
            "nexe": getNexeCommand(appName, nodeVersion),
            "build": "npm run tsc && npm run webpack && npm run nexe",
            "check-csc": "node -e \"require(\\\"./launcher/launcherCompiler\\\").checkCscInPath(true)\"",
            "rebuild-launcher": `csc /t:winexe /out:resources/bin/${appName}-launcher.exe launcher/launcher.cs`
        };
        mergeIntoPackageJson(root, "scripts", scripts);

        // Add husky
        const husky = {
            hooks: {
                "pre-commit": `git diff HEAD --exit-code --stat launcher.cs || npm run check-csc && npm run rebuild-launcher && git add resources/bin/${appName}-launcher.exe`
            }
        };
        mergeIntoPackageJson(root, "husky", husky);

        resolve();
    })
}

function buildJavaScriptProject(root: string, appName: string, nodeVersion: string) {
    return new Promise((resolve, reject) => {
        console.log(`Building project ${chalk.green("files")}.`);
        console.log();

        writeFile(path.resolve(root, WebpackConfigFilename), replaceAppNamePlaceholder(readResource(jsWebpackConfigResourceLocation), appName));
        fs.ensureDirSync(path.resolve(root, "src"));
        writeFile(path.resolve(root, "src", "index.js"), replaceAppNamePlaceholder(readResource(jsIndexResourceLocation), appName));

        // Add scripts
        const scripts: { [key: string]: string } = {
            "start": "node src/index.js",
            "webpack": "webpack",
            "nexe": getNexeCommand(appName, nodeVersion),
            "build": "npm run webpack && npm run nexe",
            "check-csc": "node -e \"require(\\\"./launcher/launcherCompiler\\\").checkCscInPath(true)\"",
            "rebuild-launcher": `csc /t:winexe /out:resources/bin/${appName}-launcher.exe launcher/launcher.cs`
        };
        mergeIntoPackageJson(root, "scripts", scripts);

        // Add husky
        const husky = {
            hooks: {
                "pre-commit": `git diff HEAD --exit-code --stat launcher.cs || npm run check-csc && npm run rebuild-launcher && git add resources/bin/${appName}-launcher.exe`
            }
        };
        mergeIntoPackageJson(root, "husky", husky);

        resolve();
    })
}

export function buildLauncher(root: string, appName: string, icon: string, typescript: boolean): Promise<void> {
    console.log(`Building project ${chalk.green("launcher")}.`);
    console.log();

    fs.ensureDirSync(path.resolve("launcher"));
    writeFile(path.resolve(launcherSrcModifiedLocation), replaceAppNamePlaceholder(readResource(launcherSrcResourceLocation), appName));
    if (typescript) {
        writeFile(path.resolve(root, "launcher", "launcherCompiler.ts"), readResource(tsLauncherCompilerLocation));
    }
    else {
        writeFile(path.resolve(root, "launcher", "launcherCompiler.js"), readResource(jsLauncherCompilerLocation));
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

    // Compiled file location
    const outputLocation: string = path.resolve(root, "resources", "bin", `${appName}-launcher.exe`);

    return compileLauncher(launcherSrcModifiedLocation, outputLocation, iconLocation);
}

function checkAppName(appName) {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(`Could not create a project called ${chalk.red(`"${appName}"`)} because of npm naming restrictions:`);
        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }

    const dependencies = [...consts.dependencies, ...consts.devDependencies].sort();
    if (dependencies.indexOf(appName) >= 0) {
        console.error(chalk.red(`We cannot create a project called ${chalk.green(appName)} because a dependency with the same name exists.\n` +
            `Due to the way npm works, the following names are not allowed:\n\n`) +
            chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n')) +
            chalk.red('\n\nPlease choose a different project name.')
        );
        process.exit(1);
    }
}

function printValidationResults(results) {
    if (typeof results !== 'undefined') {
        results.forEach(error => {
            console.error(chalk.red(`  *  ${error}`));
        });
    }
}

// If project only contains files generated by GH, it’s safe.
// Also, if project contains remnant error logs from a previous installation, lets remove them now.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebook/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
    const validFiles: string[] = consts.validFiles;
    console.log();

    const conflicts = fs
        .readdirSync(root)
        .filter(file => !validFiles.includes(file))
        // IntelliJ IDEA creates module files before CRA is launched
        .filter(file => !/\.iml$/.test(file))
        // Don't treat log files from previous installation as conflicts
        .filter(file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0));

    if (conflicts.length > 0) {
        console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
        console.log();
        for (const file of conflicts) {
            console.log(`  ${file}`);
        }
        console.log();
        console.log('Either try using a new directory name, or remove the files listed above.');

        return false;
    }

    // Remove any remnant files from a previous installation
    const currentFiles = fs.readdirSync(path.join(root));
    currentFiles.forEach(file => {
        errorLogFilePatterns.forEach(errorLogFilePattern => {
            // This will catch `npm-debug.log*` files
            if (file.indexOf(errorLogFilePattern) === 0) {
                fs.removeSync(path.join(root, file));
            }
        });
    });
    return true;
}

function checkThatNpmCanReadCwd() {
    const cwd = process.cwd();
    let childOutput = null;
    try {
        // Note: intentionally using spawn over exec since
        // the problem doesn't reproduce otherwise.
        // `npm config list` is the only reliable way I could find
        // to reproduce the wrong path. Just printing process.cwd()
        // in a Node process was not enough.
        childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
    }
    catch (err) {
        // Something went wrong spawning node.
        // Not great, but it means we can't do this check.
        // We might fail later on, but let's continue.
        return true;
    }
    if (typeof childOutput !== 'string') {
        return true;
    }
    const lines = childOutput.split('\n');
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = '; cwd = ';
    const line = lines.find(line => line.indexOf(prefix) === 0);
    if (typeof line !== 'string') {
        // Fail gracefully. They could remove it.
        return true;
    }
    const npmCWD = line.substring(prefix.length);
    if (npmCWD === cwd) {
        return true;
    }
    console.error(
        chalk.red(`Could not start an npm process in the right directory.\n\n` +
            `The current directory is: ${chalk.bold(cwd)}\n` +
            `However, a newly started npm process runs in: ${chalk.bold(npmCWD)}\n\n` +
            `This is probably caused by a misconfigured system terminal shell.`
        )
    );
    if (process.platform === 'win32') {
        console.error(chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
            `  ${chalk.cyan('reg')} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk.cyan('reg')} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk.red(`Try to run the above two lines in the terminal.\n`) +
            chalk.red(`To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`)
        );
    }
    return false;
}

function readFile(fileName: string) {
    return fs.readFileSync(fileName, "utf8");
}

function readJsonFile(jsonFileName: string) {
    return JSON.parse(readFile(jsonFileName));
}

function readResource(resourceRelativePath) {
    return readFile(path.resolve(__dirname, resourceRelativePath));
}

function readJsonResource(resourceRelativePath) {
    return JSON.parse(readResource(resourceRelativePath));
}

function replaceAppNamePlaceholder(str: string, appName: string): string {
    return str.replace(/<APPNAME>/g, `${appName}`)
}

function writeJson(fileName: string, object) {
    fs.writeFileSync(fileName, JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL);
}

function writeFile(fileName: string, data: string) {
    fs.writeFileSync(fileName, data.replace(/\r/g, "").replace(/\n/g, os.EOL));
}


function mergeIntoPackageJson(root: string, field: string, data: any) {
    const packageJsonPath = path.resolve(root, packageJsonFilename);
    let packageJson = readJsonFile(packageJsonPath);
    if (Array.isArray(data)) {
        let list = (packageJson[field] || []).concat(data).reduce((acc, cur) => {
            acc[cur] = cur;
            return acc;
        }, {});
        packageJson[field] = Object.keys(list);
    }
    else {
        packageJson[field] = Object.assign(packageJson[field] || {}, data);
    }
    writeJson(packageJsonPath, packageJson);
}

export function checkNodeVersion(nodeVersion?: string): Promise<string> {
    return new Promise<string>(((resolve, reject) => {
        const windowsPrefix: string = "windows-x64";
        const windowsPrefixLength: number = windowsPrefix.length + 1;
        const options = {
            headers: {
                'User-Agent': 'request'
            }
        };
        request.get("https://api.github.com/repos/nexe/nexe/releases/latest", options,  (error, response, body) => {

            const result = body && JSON.parse(body);
            const assets = result && result.assets;

            let nexeNodeVersion: string;
            if (nodeVersion) {
                // Find exact
                let split = nodeVersion.split(".");
                const major: number = split.length > 0 && (Number(split[0]) || 0) || 0;
                const minor: number = split.length > 1 && (Number(split[1]) || 0) || 0;
                const patch: number = split.length > 2 && (Number(split[2]) || 0) || 0;
                const lookupVersion = `${windowsPrefix}-${major}.${minor}.${patch}`;

                const windowsVersion = assets && assets.find(asset => asset.name === lookupVersion);
                if (windowsVersion && windowsVersion.name) {
                    nexeNodeVersion = windowsVersion.name;
                    console.log(`Found version ${chalk.green(nodeVersion)} in nexe`);
                }
                else {
                    console.log(`Can't find node version ${chalk.red(nodeVersion)} in nexe. Looking for latest nexe release`);
                }
            }

            if (!nexeNodeVersion) {
                // Find latest
                const windowsVersions = assets && assets.filter(asset => asset.name.startsWith(windowsPrefix)).map(asset => asset.name);
                const latestWindowsVersion = windowsVersions && windowsVersions.reduce((acc, cur) => {
                    let curSemVer: string = cur.substring(windowsPrefixLength);
                    let accSemVer: string = acc.substring(windowsPrefixLength);
                    acc = semverCompare(curSemVer, accSemVer) > 0 ? cur: acc;
                    return acc;
                }, `${windowsPrefix}-0.0.0`);

                console.log(`Using latest nexe release: ${latestWindowsVersion}`);
                nexeNodeVersion = latestWindowsVersion;
            }

            resolve(nexeNodeVersion);
        })
    }))
}

function getNexeCommand(appName: string, nodeVersion: string) {
    return `nexe -t ${nodeVersion} -o dist/${appName}.exe`;
}
