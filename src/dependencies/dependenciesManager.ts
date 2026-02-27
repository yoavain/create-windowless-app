import chalk from "chalk";
import { spawnSync } from "child_process";
import { consts } from "../consts";

const install = async (dependencies: string[], isDev: boolean, verbose?: boolean): Promise<void> => {
    const args = ["install", isDev ? "--save-dev" : "--save", "--save-exact", "--loglevel", "error"].concat(dependencies);
    if (verbose) {
        args.push("--verbose");
    }
    console.log(`Installing ${chalk.green(isDev ? "dev dependencies" : "dependencies")}.`);
    console.log();

    const spawnResult = spawnSync(`npm ${args.join(" ")}`, { stdio: "inherit", shell: true });
    if (spawnResult.status !== 0) {
        return Promise.reject({ command: `npm ${args.join(" ")}` });
    }
};


export class DependenciesManager {
    #dependencies: string[] = [];
    #devDependencies: string[] = [];
    
    constructor(typescript: boolean, husky: boolean) {
        this.#dependencies = consts.dependencies;
        this.#devDependencies = consts.devDependencies;
        if (typescript) {
            this.#devDependencies = this.#devDependencies.concat(consts.tsDevDependencies);
        }
        if (husky) {
            this.#devDependencies = this.#devDependencies.concat(consts.huskyDependencies);
        }
    }
    
    async installAll(verbose?: boolean) {
        await install(this.#dependencies, false, verbose);
        await install(this.#devDependencies, true, verbose);
    }
}
