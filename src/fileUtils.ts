import * as fs from "fs-extra";
import path from "path";
import os from "os";
import { PathLike } from "fs";

export const readFile = (fileName: string): string => {
    return fs.readFileSync(fileName, "utf8");
};

export const readJsonFile = (jsonFileName: string): any => {
    return JSON.parse(readFile(jsonFileName));
};

export const readResource = (resourceRelativePath): string => {
    return readFile(path.resolve(__dirname, resourceRelativePath));
};

export const readJsonResource = (resourceRelativePath): any => {
    return JSON.parse(readResource(resourceRelativePath));
};

export const writeJson = (fileName: string, object): void => {
    fs.writeFileSync(fileName, JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL);
};

export const writeFile = (fileName: string, data: string): void => {
    fs.writeFileSync(fileName, data.replace(/\r/g, "").replace(/\n/g, os.EOL));
};

export const copyFile = (source: PathLike, destination: PathLike): void => {
    fs.copyFileSync(source, destination);
};
