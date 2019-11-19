import { checkCscInPath } from "../templates/typescript/launcher/launcherCompiler";
import mockedEnv from "mocked-env";
import mockFs from "mock-fs";

describe("Test checkCscInPath", () => {
    it("Test CSC found", () => {
        let restoreEnv = mockedEnv({
            PATH: "fakePath"
        });
        mockFs({
            "fakePath/csc.exe": "exist"
        });

        return checkCscInPath(false).then((result) => {
            expect(result).toBeTruthy();
            restoreEnv();
            mockFs.restore();
        });
    });
    it("Test CSC not found", () => {
        let restoreEnv = mockedEnv({
            PATH: "fakePath"
        });

        return checkCscInPath(false).then((result) => {
            expect(result).toBeFalsy();
            restoreEnv();
        });
    });
});
