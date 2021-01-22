import { checkMsbuildInPath } from "../src/launcherCompiler";
import mockedEnv from "mocked-env";
import mockFs from "mock-fs";

describe("Test checkMsbuildInPath", () => {
    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
    });

    it("Test MSBuild found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });
        mockFs({
            "fakePath/msbuild.exe": "exist"
        });

        const result: boolean = await checkMsbuildInPath(false);
        expect(result).toBeTruthy();
        restoreEnv();

    });
    it("Test MSBuild not found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });

        const result: boolean = await checkMsbuildInPath(false);
        expect(result).toBeFalsy();
        restoreEnv();
    });
});
