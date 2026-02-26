import type { Formatter } from ".";
import { copyFolderRecursiveSync } from ".";
import { replaceAppNamePlaceholder } from "../createWindowlessAppUtils";
import { copyFileSync } from "fs-extra";
import path from "path";

type FileManagerOptions = {
    targetRoot: string;
    appName: string;
    typeScript: boolean;
    husky: boolean;
    icon: string;
};

export class FileManager {
    #templatesRoot: string;
    #targetRoot: string;
    #typeScript: boolean;
    #husky: boolean;
    #icon: string;
    #formatter: Formatter;

    constructor({ targetRoot, appName, typeScript, husky, icon }: FileManagerOptions) {
        this.#templatesRoot = path.resolve(__dirname, "..", "..", "templates");
        this.#targetRoot = targetRoot;

        this.#typeScript = typeScript;
        this.#husky = husky;
        this.#icon = icon;

        this.#formatter = (str: string) => replaceAppNamePlaceholder(appName, str);
    }

    copyTemplate() {
        // common files
        copyFolderRecursiveSync(path.resolve(this.#templatesRoot, "common"), path.resolve(this.#targetRoot), this.#formatter);

        // TypeScript or JavaScript
        if (this.#typeScript) {
            copyFolderRecursiveSync(path.resolve(this.#templatesRoot, "typescript"), path.resolve(this.#targetRoot), this.#formatter);
        }
        else {
            copyFolderRecursiveSync(path.resolve(this.#templatesRoot, "javascript"), path.resolve(this.#targetRoot), this.#formatter);
        }
        
        // Husky
        if (this.#husky) {
            copyFolderRecursiveSync(path.resolve(this.#templatesRoot, ".husky"), path.resolve(this.#targetRoot, ".husky"), this.#formatter);
        }
        
        // Launcher
        copyFolderRecursiveSync(path.resolve(this.#templatesRoot, "launcher"), path.resolve(this.#targetRoot, "launcher"), this.#formatter);

        // Icon
        if (this.#icon) {
            copyFileSync(path.resolve(this.#icon), path.resolve(this.#targetRoot, "launcher", "launcher.ico"));
        }
    }
}