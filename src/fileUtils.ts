import { copyFileSync, readFileSync, writeFileSync } from "fs-extra";
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
