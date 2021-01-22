import { checkMsbuildInPath } from "../src/launcherCompiler";
import mockedEnv from "mocked-env";
import mockFs from "mock-fs";

describe("Test checkMsbuildInPath", () => {
    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
    });

    it("Test CSC found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });
        mockFs({
            "fakePath/csc.exe": "exist"
        });

        const result: boolean = await checkMsbuildInPath(false);
        expect(result).toBeTruthy();
        restoreEnv();

    });
    it("Test CSC not found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });

        const result: boolean = await checkMsbuildInPath(false);
        expect(result).toBeFalsy();
        restoreEnv();
    });
});
