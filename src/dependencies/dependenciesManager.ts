import chalk from "chalk";
import spawn from "cross-spawn";

const dependencies = [
    "node-notifier",
    "winston"
];

const devDependencies = [
    "fs-extra",
    "jest",
    "webpack",
    "webpack-cli",
    "copy-webpack-plugin",
    "rimraf",
    "cross-spawn",
    "postject"
];

const tsDevDependencies =[
    "@types/jest",
    "@types/node",
    "@tsconfig/node20",
    "@types/node-notifier",
    "@types/winston",
    "ts-loader",
    "ts-node",
    "typescript",
    "@types/cross-spawn"
];

const huskyDependencies = [
    "husky"
];

const install = async (dependencies: string[], isDev: boolean, verbose?: boolean): Promise<void> => {
    const command = "npm";
    const args = ["install", isDev ? "--save-dev" : "--save", "--save-exact", "--loglevel", "error"].concat(dependencies);
    if (verbose) {
        args.push("--verbose");
    }
    console.log(`Installing ${chalk.green(isDev ? "dev dependencies" : "dependencies")}.`);
    console.log();

    spawn.sync(command, args, { stdio: "inherit" });
};


export class DependenciesManager {
    #dependencies: string[] = [];
    #devDependencies: string[] = [];
    
    constructor(typescript: boolean, husky: boolean) {
        this.#dependencies = dependencies;
        this.#devDependencies = devDependencies;
        if (typescript) {
            this.#devDependencies = this.#devDependencies.concat(tsDevDependencies);
        }
        if (husky) {
            this.#devDependencies = this.#devDependencies.concat(huskyDependencies);
        }
    }
    
    async install(verbose?: boolean) {
        await install(this.#dependencies, false, verbose);
        await install(this.#devDependencies, true, verbose);
    }
}
