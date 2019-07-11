import * as commander from "commander";
import { Command } from "commander";
import chalk from "chalk";
import * as envinfo from "envinfo";
import * as path from "path";
import * as fs from "fs-extra";
import validateProjectName from 'validate-npm-package-name';
import * as os from "os";
import spawn from "cross-spawn";

const packageJson = require('../package.json');

const consts = require('../resources/consts.json');

// These files should be allowed to remain on a failed install, but then silently removed during the next create.
const errorLogFilePatterns = consts.errorLogFilePatterns;

export function createWindowlessApp() {
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

    function printValidationResults(results) {
        if (typeof results !== 'undefined') {
            results.forEach(error => {
                console.error(chalk.red(`  *  ${ error }`));
            });
        }
    }

    const hiddenProgram = new commander.Command()
        .option('--internal-testing-template <path-to-template>', `(internal usage only, DO NOT RELY ON THIS) use a non-standard application template`)
        .parse(process.argv);

    createApp(projectName, program.verbose, program.typescript);
}

function createApp(name: string, verbose: boolean, useTypescript: boolean) {
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
    };
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    run(root, appName, verbose, originalDirectory, useTypescript);
}

function run(root: string, appName: string, verbose: boolean, originalDirectory: string, useTypescript: boolean): Promise<void> {
    const dependencies = [...consts.dependencies];
    const devDependencies = [...consts.devDependencies];
    if (useTypescript) {
        devDependencies.push(...consts.tsDevDependencies);
    }

    return install(root, dependencies, verbose, false)
        .then(() => {
            return install(root, devDependencies, verbose, true);
        })
        .then(() => console.log("Done"));
}

function install(root: string, dependencies: string[], verbose: boolean, isDev: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = 'npm';
        let args = ['install', isDev ? '--save-dev' : '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);
        if (verbose) {
            args.push('--verbose');
        }

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
    });
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