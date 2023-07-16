import { getHuskyScripts, getJsScripts, getPackageJsonBase, getTsScripts } from "./packageJsonConsts";

export class PackageJsonBuilder {
    #appName: string;
    #typescript: boolean = true;
    #husky: boolean = false;

    constructor(appName: string) {
        this.#appName = appName;
    }

    withJavaScript(): this {
        this.#typescript = false;
        return this;
    }

    withHusky(): this {
        this.#husky = true;
        return this;
    }

    build(): string {
        let packageJson = getPackageJsonBase(this.#appName);
        if (this.#typescript) {
            packageJson = { ...packageJson, ...getTsScripts(this.#appName) };
        }
        else {
            packageJson = { ...packageJson, ...getJsScripts(this.#appName) };
        }
        if (this.#husky) {
            packageJson = { ...packageJson, ...getHuskyScripts(this.#appName) };
        }

        return JSON.stringify(packageJson, null, 2);
    }
}
