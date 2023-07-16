import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs-extra";
import path from "path";
import os from "os";
import type { PathLike } from "fs";

export const readFile = (fileName: string): string => {
    return readFileSync(fileName, "utf8");
};

export const readJsonFile = (jsonFileName: string): any => {
    return JSON.parse(readFile(jsonFileName));
};

export const readResource = (resourceRelativePath: string): string => {
    return readFile(path.resolve(__dirname, resourceRelativePath));
};

export const readJsonResource = (resourceRelativePath: string): any => {
    return JSON.parse(readResource(resourceRelativePath));
};

export const writeJson = (fileName: string, object): void => {
    writeFileSync(fileName, JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL);
};

export const writeFile = (fileName: string, data: string): void => {
    writeFileSync(fileName, data.replace(/\r/g, "").replace(/\n/g, os.EOL));
};

export const copyFile = (source: PathLike, destination: PathLike): void => {
    copyFileSync(source, destination);
};

const EXTENSIONS_TO_FORMAT = new Set<string>([".ts", ".js", ".cs", ".json", ".csproj"]);

export type Formatter = (s: string) => string;

function copyFileSyncWithFormatter(sourceFile, targetFile, formatter?: Formatter) {
    console.log(`copyFileSyncWithFormatter from ${sourceFile} to ${targetFile}`);

    if (existsSync(targetFile)) {
        throw new Error(`Target file already exists: ${targetFile}`);
    }

    let data = readFileSync(sourceFile, { encoding: "utf8" });

    const ext: string = path.extname(sourceFile);
    if (typeof formatter === "function" && EXTENSIONS_TO_FORMAT.has(ext.toLowerCase())) {
        console.log(`modifying ${sourceFile}`);
        data = formatter(data);
    }

    writeFileSync(targetFile, data, { encoding: "utf8" });
}

export const copyFolderRecursiveSync = (sourceFolder, targetFolder, formatter?: Formatter) => {
    console.log(`copyFolderRecursiveSync from ${sourceFolder} to ${targetFolder}`);

    if (!existsSync(targetFolder)) {
        console.log(`mkdir ${targetFolder}`);
        mkdirSync(targetFolder);
    }
    else if (!lstatSync(targetFolder).isDirectory()) {
        throw new Error("Target exists and is not a directory.");
    }

    // Copy
    if (lstatSync(sourceFolder).isDirectory()) {
        readdirSync(sourceFolder).forEach((child: string) => {
            const curSource = path.join(sourceFolder, child);
            const curTarget = path.join(targetFolder, child);
            if (lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget, formatter);
            }
            else {
                copyFileSyncWithFormatter(curSource, curTarget, formatter);
            }
        });
    }
};
