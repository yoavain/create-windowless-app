import { checkMsbuildInPath } from "../src/launcherCompiler";
import mockedEnv from "mocked-env";
import mockFs from "mock-fs";

describe("Test checkMsbuildInPath", () => {
    let p;
    beforeEach(() => {
        p = process;
    });
    afterEach(() => {
        mockFs.restore();
        jest.restoreAllMocks();
        process = p;
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
