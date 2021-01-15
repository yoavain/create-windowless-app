import { parseCommand } from "../src/cliParser";
import { v4 as uuid } from "uuid";
import * as path from "path";

describe("Test cliParser", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it("should parse default flags", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
    });

    it("should parse flags: --skip-install", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--skip-install"]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toEqual(true);
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
    });

    it("should parse flags: --no-typescript", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--no-typescript"]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(false);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
    });

    it("should parse flags: --no-husky", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--no-husky"]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(false);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
    });

    it("should parse flags: --verbose", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--verbose"]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toEqual(true);
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
    });

    it("should parse flags: --icon", async () => {
        const sandbox: string = uuid();

        const iconLocation: string = path.join(__dirname, "..", "templates", "common", "resources", "windows-launcher.ico");
        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--icon", iconLocation]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toEqual(iconLocation);
        expect(nodeVersion).toBeUndefined();
    });

    it("should error on non existing icon", async () => {
        // @ts-ignore
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(1);
        });
        // @ts-ignore
        const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });

        const sandbox: string = uuid();

        const iconLocation: string = path.join(__dirname, "..", "templates", "common", "resources", "not-exists.ico");
        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--icon", iconLocation]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toBeUndefined();
        expect(mockStdout.mock.calls[0][0]).toContain("Cannot find icon in");
    });

    it("should parse flags: --node-version", async () => {
        const sandbox: string = uuid();

        const { projectName, verbose, typescript, husky, skipInstall, icon, nodeVersion } = await  parseCommand(["node.exe", "dummy.ts", sandbox, "--node-version", "12.12.0"]);

        expect(projectName).toEqual(sandbox);
        expect(verbose).toBeUndefined();
        expect(typescript).toEqual(true);
        expect(husky).toEqual(true);
        expect(skipInstall).toBeUndefined();
        expect(icon).toBeUndefined();
        expect(nodeVersion).toEqual("12.12.0");
    });

    it("should print help with flags: --help", async () => {
        // @ts-ignore
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(0);
        });
        // @ts-ignore
        const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });
        const sandbox: string = uuid();

        parseCommand(["node.exe", "dummy.ts", sandbox, "--help"]);

        expect(mockStdout.mock.calls[0][0]).toMatchSnapshot("help-stdout");
    });

    it("should error on missing project name", async () => {
        // @ts-ignore
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(1);
        });
        // @ts-ignore
        const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });

        const { projectName } = await parseCommand(["node.exe", "dummy.ts"]);

        expect(projectName).toBeUndefined();
        expect(mockStdout.mock.calls[0][0]).toMatchSnapshot("missing-project-name-stdout");
    });
});