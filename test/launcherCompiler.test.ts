import { checkCscInPath } from "../templates/typescript/launcher/launcherCompiler";
import mockedEnv from "mocked-env";
import mockFs from "mock-fs";

describe("Test checkCscInPath", () => {
    it("Test CSC found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });
        mockFs({
            "fakePath/csc.exe": "exist"
        });

        const result: boolean = await checkCscInPath(false);
        expect(result).toBeTruthy();
        restoreEnv();
        mockFs.restore();
    });
    it("Test CSC not found", async () => {
        const restoreEnv = mockedEnv({
            PATH: "fakePath"
        });

        const result: boolean = await checkCscInPath(false);
        expect(result).toBeFalsy();
        restoreEnv();
    });
});
