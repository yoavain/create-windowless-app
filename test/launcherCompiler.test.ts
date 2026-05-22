// Mocks should be first
const mockSpawnSync = jest.fn(() => ({ status: 0 }));

jest.mock("child_process", () => ({
    spawnSync: mockSpawnSync
}));

import { checkMsbuildInPath, compileLauncher } from "../src/launcherCompiler";
import mockedEnv from "mocked-env";
import { dir } from "tmp-promise";
import path from "path";
import { promises as fs } from "fs";

describe("compileLauncher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should resolve when spawnSync returns status 0", async () => {
        mockSpawnSync.mockReturnValue({ status: 0 });
        await expect(compileLauncher()).resolves.toBeUndefined();
    });

    it("should reject with { command } when spawnSync returns non-zero status", async () => {
        mockSpawnSync.mockReturnValue({ status: 1 });
        await expect(compileLauncher()).rejects.toMatchObject({ command: "msbuild.exe ./launcher/launcher.csproj" });
    });
});

describe("Test checkMsbuildInPath", () => {
    let p;
    beforeEach(() => {
        p = process;
    });
    afterEach(() => {
        jest.restoreAllMocks();
        process = p;
    });

    it("Test MSBuild found", async () => {
        const d = await dir({ unsafeCleanup: true });
        const restoreEnv = mockedEnv({
            PATH: d.path
        });
        try {
            await fs.writeFile(path.join(d.path, "msbuild.exe"), "exist", { encoding: "utf-8" });

            const result: boolean = await checkMsbuildInPath(false);
            expect(result).toBeTruthy();
        }
        finally {
            restoreEnv();
            await d.cleanup();
        }
    });
    it("Test MSBuild not found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });

        const result: boolean = await checkMsbuildInPath(false);
        expect(result).toBeFalsy();
        restoreEnv();
    });
    it("Test MSBuild not found, with exit", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        jest.spyOn(process, "exit").mockImplementation(() => {});

        const result: boolean = await checkMsbuildInPath(true);
        expect(result).toBeFalsy();
        expect(process.exit).toHaveBeenCalledTimes(1);
        expect(process.exit).toHaveBeenCalledWith(1);
        restoreEnv();
    });
});
