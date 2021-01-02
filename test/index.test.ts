import path from "path";
import fs from "fs-extra";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import * as del from "del";
import { readJsonFile } from "~src/fileUtils";
import consts from "~src/consts";
import type { ExecException } from "child_process";

jest.setTimeout(300000);

let SANDBOXES = new Set<string>();

type CliResult = {
    code: number;
    stdout?: string;
    stderr?: string;
    error?: ExecException;
};

const testFilesExists = (root: string, typescript: boolean = true, husky: boolean = true, nodeModules: boolean = true): void => {
    // Files
    const scriptExt: string = typescript ? "ts" : "js";
    expect(fs.existsSync(path.resolve(root, "package.json"))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "webpack.config.js"))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "tsconfig.json"))).toEqual(typescript);
    expect(fs.existsSync(path.resolve(root, "src", `index.${scriptExt}`))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "launcher", "launcher.cs"))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "launcher", "launcher.ico"))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "launcher", `launcherCompiler.${scriptExt}`))).toBeTruthy();
    expect(fs.existsSync(path.resolve(root, "resources", "bin", `${root}-launcher.exe`))).toBeTruthy();
    expect(fs.pathExistsSync(path.resolve(root, "node_modules"))).toEqual(nodeModules);

    const packageJson = readJsonFile(path.resolve(root, "package.json"));

    // Dependencies
    let expectedDependencies = [...consts.dependencies];
    let expectedDevDependencies = [...consts.devDependencies];
    if (typescript) {
        expectedDevDependencies = expectedDevDependencies.concat(consts.tsDevDependencies);
    }
    if (husky) {
        expectedDevDependencies = expectedDevDependencies.concat(consts.huskyDependencies);
    }
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(expectedDependencies.sort());
    expect(Object.keys(packageJson.devDependencies).sort()).toEqual(expectedDevDependencies.sort());

    // scripts
    expect(!!(packageJson && packageJson.husky && packageJson.husky.hooks && packageJson.husky.hooks["pre-commit"])).toEqual(husky);
};

const cli = (args: string[], cwd?: string): Promise<CliResult> => {
    return new Promise((resolve) => {
        const command: string = `node -r ts-node/register -r tsconfig-paths/register ${path.resolve("src/index.ts")} ${args.join(" ")}`;
        console.log(`Testing command: ${command}`);
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.log(JSON.stringify(error));
                console.log(JSON.stringify({ stdout, stderr }));
            }
            resolve({
                code: error && error.code ? error.code : 0,
                error,
                stdout,
                stderr
            });
        });
    });
};

describe("Test CLI", () => {
    afterAll(() => {
        SANDBOXES.forEach((sandbox) => {
            del.sync(sandbox);
        });
    });

    it("should create a prototype project with default flags", async () => {
        const sandbox: string = uuid();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        expect(result.stderr).toEqual("");
        testFilesExists(sandbox);
        del.sync(sandbox);
    });

    it("should create a prototype project with flags: --skip-install", async () => {
        const sandbox: string = uuid();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox, "--skip-install"], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        expect(result.stderr).toEqual("");
        testFilesExists(sandbox, true, true, false);
        del.sync(sandbox);
    });

    it("should create a prototype project with flags: --no-typescript --skip-install", async () => {
        const sandbox: string = uuid();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox, "--no-typescript --skip-install"], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        expect(result.stderr).toEqual("");
        testFilesExists(sandbox, false, true, false);
        del.sync(sandbox);
    });

    it("should create a prototype project with flags: --no-husky --skip-install", async () => {
        const sandbox: string = uuid();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox, "--no-husky", "--skip-install"], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        expect(result.stderr).toEqual("");
        testFilesExists(sandbox, true, false, false);
        del.sync(sandbox);
    });
});
