import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs-extra";
import path from "path";
import os from "os";

export const writeJson = (fileName: string, json: object): void => {
    writeFileSync(fileName, JSON.stringify(json, null, 2).replace(/\n/g, os.EOL) + os.EOL);
};

const TEXT_FORMAT_EXTENSIONS = new Set<string>([".ts", ".js", ".cs", ".json", ".csproj"]);

export type Formatter = (s: string) => string;

function copyFileSyncWithFormatter(sourceFile, targetFile, formatter?: Formatter) {
    console.log(`copyFileSyncWithFormatter from ${sourceFile} to ${targetFile}`);

    if (existsSync(targetFile)) {
        throw new Error(`Target file already exists: ${targetFile}`);
    }

    const ext: string = path.extname(sourceFile);
    if (typeof formatter === "function" && TEXT_FORMAT_EXTENSIONS.has(ext.toLowerCase())) {
        console.log(`modifying ${sourceFile}`);
        const data = readFileSync(sourceFile, { encoding: "utf8" });
        writeFileSync(targetFile, formatter(data), { encoding: "utf8" });
    }
    else {
        const data = readFileSync(sourceFile);
        writeFileSync(targetFile, data);
    }
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
            const curSource: string = path.join(sourceFolder, child);
            const curTarget: string = path.join(targetFolder, child);
            if (lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget, formatter);
            }
            else {
                copyFileSyncWithFormatter(curSource, curTarget, formatter);
            }
        });
    }
};
