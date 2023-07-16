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

    build(): object {
        let packageJson = getPackageJsonBase(this.#appName);
        if (this.#typescript) {
            packageJson = { ...packageJson, scripts: { ...packageJson.scripts, ...getTsScripts(this.#appName) } };
        }
        else {
            packageJson = { ...packageJson, scripts: { ...packageJson.scripts, ...getJsScripts(this.#appName) } };
        }
        if (this.#husky) {
            packageJson = { ...packageJson, scripts: { ...packageJson.scripts, ...getHuskyScripts(this.#appName) } };
        }
        return packageJson;
    }
}
