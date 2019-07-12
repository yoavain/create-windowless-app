import * as commander from "commander";
import { Command } from "commander";
import chalk from "chalk";
import * as envinfo from "envinfo";
import * as path from "path";
import * as fs from "fs-extra";
import validateProjectName from 'validate-npm-package-name';
import * as os from "os";
import spawn from "cross-spawn";

const packageJsonFilename = "package.json";
const packageJson = require(`../${packageJsonFilename}`);

const consts = require('../resources/consts.json');
const tsConfigFilename = "tsconfig.json";
const WebpackConfigFilename = "webpack.config.js";

// TypeScript
const tsWebpackConfigLocation = "../templates/typescript/webpack.config.js";
const tsConfig = require("../templates/typescript/tsconfig.json");
const tsIndexLocation = "../templates/typescript/src/index.ts";

// JavaScript
const jsWebpackConfigLocation = "../templates/javascript/webpack.config.js";
const jsIndexLocation = "../templates/javascript/src/index.js";

// These files should be allowed to remain on a failed install, but then silently removed during the next create.
const errorLogFilePatterns = consts.errorLogFilePatterns;

export function createWindowlessApp(): Promise<void> {
    let projectName: string = undefined;

    const program: Command = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments('<project-directory>')
        .usage(`${ chalk.green('<project-directory>') } [options]`)
        .action(name => {
            projectName = name;
        })
        .option('--verbose', 'print additional logs')
        .option('--info', 'print environment debug info')
        .option('--typescript')
        .option('--skipInstall', 'write dependencies to package.json without installing')
        .allowUnknownOption()
        .on('--help', () => {
            console.log(`    Only ${ chalk.green('<project-directory>') } is required.`);
            console.log();
            console.log(`    If you have any problems, do not hesitate to file an issue:`);
            console.log(`      ${ chalk.cyan('https://github.com/yoavain/create-windowless-app/issues/new') }`);
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

    if (typeof projectName === 'undefined') {
        console.error('Please specify the project directory:');
        console.log(`  ${ chalk.cyan(program.name()) } ${ chalk.green('<project-directory>') }`);
        console.log();
        console.log('For example:');
        console.log(`  ${ chalk.cyan(program.name()) } ${ chalk.green('my-windowless-app') }`);
        console.log();
        console.log(`Run ${ chalk.cyan(`${ program.name() } --help`) } to see all options.`);
        process.exit(1);
    }

    return createApp(projectName, program.verbose, program.typescript, program.skipInstall);
}

function createApp(name: string, verbose: boolean, useTypescript: boolean, skipInstall: boolean) {
    const root = path.resolve(name);
    const appName = path.basename(root);

    checkAppName(appName);
    fs.ensureDirSync(name);
    if (!isSafeToCreateProjectIn(root, name)) {
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

    return run(root, appName, verbose, originalDirectory, useTypescript, skipInstall);
}

function run(root: string, appName: string, verbose: boolean, originalDirectory: string, useTypescript: boolean, skipInstall: boolean): Promise<void> {
    const dependencies = [...consts.dependencies];
    const devDependencies = [...consts.devDependencies];
    if (useTypescript) {
        devDependencies.push(...consts.tsDevDependencies);
    }

    return install(root, dependencies, verbose, false, skipInstall)
        .then(() => {
            return install(root, devDependencies, verbose, true, skipInstall);
        })
        .then(()=> {
            if (useTypescript) {
                return buildTypeScriptProject(root, appName);
            }
            else {
                return buildJavaScriptProject(root, appName);
            }
        })
        .then(() => console.log("Done"))
        .catch(reason => {
            console.log();
            console.log('Aborting installation.');
            if (reason.command) {
                console.log(`  ${ chalk.cyan(reason.command) } has failed.`);
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
                        console.log(`Deleting generated file... ${ chalk.cyan(file) }`);
                        fs.removeSync(path.join(root, file));
                    }
                });
            });
            const remainingFiles = fs.readdirSync(path.join(root));
            if (!remainingFiles.length) {
                // Delete target folder if empty
                console.log(`Deleting ${ chalk.cyan(`${ appName }/`) } from ${ chalk.cyan(path.resolve(root, '..')) }`);
                process.chdir(path.resolve(root, '..'));
                fs.removeSync(path.join(root));
            }
            console.log('Done (with errors).');
            process.exit(1);
        });
}

function install(root: string, dependencies: string[], verbose: boolean, isDev: boolean, skipInstall: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = 'npm';
        let args = ['install', isDev ? '--save-dev' : '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);
        if (verbose) {
            args.push('--verbose');
        }

        if (!skipInstall) {
            const child = spawn(command, args, { stdio: 'inherit' });
            child.on('close', code => {
                if (code !== 0) {
                    reject({
                        command: `${ command } ${ args.join(' ') }`,
                    });
                    return;
                }
                resolve();
            });
        }
        else {
            mergeIntoPackageJson(root, isDev ? "devDependencies" : "dependencies", dependencies);
            resolve();
        }
    });
}

function buildTypeScriptProject(root: string, appName: string) {
    return new Promise((resolve, reject) => {
        writeJson(path.resolve(root, tsConfigFilename), tsConfig);
        writeFile(path.resolve(root, WebpackConfigFilename), readFile(path.resolve(tsWebpackConfigLocation)));
        fs.ensureDirSync(path.resolve(root, "src"));
        writeFile(path.resolve(root, "src", "index.ts"), readFile(path.resolve(tsIndexLocation)));
        // Add scripts
        const scripts: { [key: string]: string } = {
            "start": "ts-node src/index.ts",
            "tsc": "tsc",
            "webpack": "webpack",
            "nexe": `nexe -o dist/${appName}.exe`,
            "build": "npm run tsc && npm run webpack && npm run nexe"
        };
        mergeIntoPackageJson(root, "scripts", scripts);
        resolve();
    })
}

function buildJavaScriptProject(root: string, appName: string) {
    return new Promise((resolve, reject) => {
        writeFile(path.resolve(root, WebpackConfigFilename), readFile(path.resolve(jsWebpackConfigLocation)));
        fs.ensureDirSync(path.resolve(root, "src"));
        writeFile(path.resolve(root, "src", "index.js"), readFile(path.resolve(jsIndexLocation)));
        // Add scripts
        const scripts: { [key: string]: string } = {
            "start": "node src/index.js",
            "webpack": "webpack",
            "nexe": `nexe -o dist/${appName}.exe`,
            "build": "npm run webpack && npm run nexe"
        };
        mergeIntoPackageJson(root, "scripts", scripts);
        resolve();
    })
}

function checkAppName(appName) {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(`Could not create a project called ${ chalk.red(`"${ appName }"`) } because of npm naming restrictions:`);
        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }

    const dependencies = [...consts.dependencies, ...consts.devDependencies].sort();
    if (dependencies.indexOf(appName) >= 0) {
        console.error(chalk.red(`We cannot create a project called ${ chalk.green(appName) } because a dependency with the same name exists.\n` +
            `Due to the way npm works, the following names are not allowed:\n\n`) +
            chalk.cyan(dependencies.map(depName => `  ${ depName }`).join('\n')) +
            chalk.red('\n\nPlease choose a different project name.')
        );
        process.exit(1);
    }
}

function printValidationResults(results) {
    if (typeof results !== 'undefined') {
        results.forEach(error => {
            console.error(chalk.red(`  *  ${ error }`));
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
        console.log(`The directory ${ chalk.green(name) } contains files that could conflict:`);
        console.log();
        for (const file of conflicts) {
            console.log(`  ${ file }`);
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
    } catch (err) {
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

function readFile(fileName) {
    return fs.readFileSync(fileName, "utf8");
}

function readJsonFile(jsonFileName) {
    return JSON.parse(readFile(jsonFileName));
}

function writeJson(fileName, object) {
    fs.writeFileSync(fileName, JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL);
}


function writeFile(fileName, data: string) {
    fs.writeFileSync(fileName, data.replace(/\n/g, os.EOL));
}

function mergeIntoPackageJson(root: string, field: string, data: any) {
    let array = Array.isArray(data);
    const packageJsonPath = path.resolve(root, packageJsonFilename);
    let packageJson = readJsonFile(packageJsonPath);
    packageJson[field] = Object.assign(packageJson.scripts || (array ? [] : {}), data);
    writeJson(packageJsonPath, packageJson);
}
