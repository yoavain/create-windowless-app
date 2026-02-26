import path from "path";
import { randomUUID } from "crypto";
import type { ExecException } from "child_process";
import { exec } from "child_process";
import { rimraf } from "rimraf";
import { consts } from "../src/consts";
import { existsSync, readFileSync } from "fs";

jest.setTimeout(300000);

const shortUUID = () => randomUUID().split("-")[0];

let SANDBOXES = new Set<string>();

type CliResult = {
    code: number;
    stdout?: string;
    stderr?: string;
    error?: ExecException;
};

// Remove fixed type in list, i.e. "node-notifier@9" => "node-notifier"
const cleanExpectedDependencies = (expectedDependencies: string[]): string[] => expectedDependencies.map((dep) => dep.lastIndexOf("@") > 0 ? dep.substring(0, dep.lastIndexOf("@")) : dep);

export const readJsonFile = (jsonFileName: string) => {
    return JSON.parse(readFileSync(jsonFileName, "utf8"));
};


const testFilesExists = (root: string, typescript: boolean = true, husky: boolean = true): void => {
    // Files
    const scriptExt: string = typescript ? "ts" : "js";
    expect(existsSync(path.resolve(root, "package.json"))).toBeTruthy();
    expect(existsSync(path.resolve(root, "sea-config.json"))).toBeTruthy();
    expect(existsSync(path.resolve(root, `webpack.config.${scriptExt}`))).toBeTruthy();
    expect(existsSync(path.resolve(root, "tsconfig.build.json"))).toEqual(typescript);
    expect(existsSync(path.resolve(root, "tsconfig.json"))).toEqual(typescript);
    expect(existsSync(path.resolve(root, "src", `index.${scriptExt}`))).toBeTruthy();
    expect(existsSync(path.resolve(root, "utils", `checkNodeVersion.${scriptExt}`))).toBeTruthy();
    expect(existsSync(path.resolve(root, "launcher", "launcher.cs"))).toBeTruthy();
    expect(existsSync(path.resolve(root, "launcher", "launcher.csproj"))).toBeTruthy();
    expect(existsSync(path.resolve(root, "launcher", "launcher.ico"))).toBeTruthy();
    expect(existsSync(path.resolve(root, "launcher", `launcherCompiler.${scriptExt}`))).toBeTruthy();
    expect(existsSync(path.resolve(root, "resources", "bin", `${root}-launcher.exe`))).toBeTruthy();
    expect(existsSync(path.resolve(root, "node_modules"))).toEqual(true);
    if (husky) {
        expect(existsSync(path.resolve(root, ".husky"))).toEqual(husky);
        expect(existsSync(path.resolve(root, ".husky", "pre-commit"))).toEqual(husky);
    }

    const packageJson = readJsonFile(path.resolve(root, "package.json"));

    // Dependencies
    let expectedDependencies = consts.dependencies;
    let expectedDevDependencies = consts.devDependencies;
    if (typescript) {
        expectedDevDependencies = expectedDevDependencies.concat(consts.tsDevDependencies);
    }
    if (husky) {
        expectedDevDependencies = expectedDevDependencies.concat(consts.huskyDependencies);
    }
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(cleanExpectedDependencies(expectedDependencies).sort());
    expect(Object.keys(packageJson.devDependencies).sort()).toEqual(cleanExpectedDependencies(expectedDevDependencies).sort());
};

const cli = (args: string[], cwd?: string): Promise<CliResult> => {
    return new Promise((resolve) => {
        const nycLocation: string = path.resolve("node_modules", ".bin", "nyc");
        const indexLocation: string = `${path.resolve("src/index.ts")}`;
        const command: string = `${nycLocation} --reporter lcov --reporter json --report-dir coverage_integration -- node -r ts-node/register/transpile-only ${indexLocation} ${args.join(" ")}`;
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
            rimraf.sync(sandbox);
        });
    });

    it("should create a prototype project with default flags", async () => {
        const sandbox: string = shortUUID();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        testFilesExists(sandbox);
        rimraf.sync(sandbox);
    });

    it("should create a prototype project with flags: --no-typescript", async () => {
        const sandbox: string = shortUUID();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox, "--no-typescript"], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        testFilesExists(sandbox, false);
        rimraf.sync(sandbox);
    });

    it("should create a prototype project with flags: --no-husky", async () => {
        const sandbox: string = shortUUID();
        SANDBOXES.add(sandbox);
        const result: CliResult = await cli([sandbox, "--no-husky"], ".");
        console.log(JSON.stringify(result, null, "\t"));
        expect(result.code).toBe(0);
        expect(result.error).toBeFalsy();
        testFilesExists(sandbox, true, false);
        rimraf.sync(sandbox);
    });
});
