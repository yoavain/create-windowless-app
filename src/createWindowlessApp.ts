import * as commander from "commander";
import chalk from "chalk";
import * as envinfo from "envinfo";

const packageJson = require('../package.json');

export function createWindowlessApp() {
    let projectName;

    const program = new commander.Command(packageJson.name)
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
                    npmPackages: ['typescript'],
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
        console.log(
            `  ${ chalk.cyan(program.name()) } ${ chalk.green('<project-directory>') }`
        );
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

    createApp(
        projectName,
        program.verbose,
        program.typescript
    );
}

function createApp(...any: any) {

}