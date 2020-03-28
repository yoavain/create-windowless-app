import validateProjectName from "validate-npm-package-name";
import chalk from "chalk";
import path from "path";
import { readJsonFile, writeJson } from "./fileUtils";
import consts from "./consts";

export const PACKAGE_JSON_FILENAME = "package.json";

const printValidationResults = (results) => {
    if (typeof results !== "undefined") {
        results.forEach((error) => {
            console.error(chalk.red(`  *  ${error}`));
        });
    }
};

export const checkAppName = (appName) => {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(`Could not create a project called ${chalk.red(`"${appName}"`)} because of npm naming restrictions:`);
        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }

    const dependencies = [...consts.dependencies, ...consts.devDependencies].sort();
    if (dependencies.indexOf(appName) >= 0) {
        console.error(
            chalk.red(
                `We cannot create a project called ${chalk.green(appName)} because a dependency with the same name exists.\n` + "Due to the way npm works, the following names are not allowed:\n\n"
            ) +
            chalk.cyan(dependencies.map((depName) => `  ${depName}`).join("\n")) +
            chalk.red("\n\nPlease choose a different project name.")
        );
        process.exit(1);
    }
};

export const getNexeCommand = (appName: string, nodeVersion: string) => {
    return `nexe -t ${nodeVersion} -o dist/${appName}.exe`;
};

export const mergeIntoPackageJson = (root: string, field: string, data: any) => {
    const packageJsonPath = path.resolve(root, PACKAGE_JSON_FILENAME);
    const packageJson = readJsonFile(packageJsonPath);
    if (Array.isArray(data)) {
        const list = (packageJson[field] || []).concat(data).reduce((acc, cur) => {
            acc[cur] = cur;
            return acc;
        }, {});
        packageJson[field] = Object.keys(list);
    }
    else {
        packageJson[field] = Object.assign(packageJson[field] || {}, data);
    }
    writeJson(packageJsonPath, packageJson);
};

export const replaceAppNamePlaceholder = (str: string, appName: string): string => {
    return str.replace(/<APPNAME>/g, `${appName}`);
};
