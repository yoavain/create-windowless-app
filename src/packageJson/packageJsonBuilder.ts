import { getJsScripts, getPackageJsonBase, getTsScripts } from "./packageJsonConsts";

export class PackageJsonBuilder {
    #appName: string;
    #typescript: boolean = true;

    constructor(appName: string) {
        this.#appName = appName;
    }

    withJavaScript(): this {
        this.#typescript = false;
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
        return packageJson;
    }
}
