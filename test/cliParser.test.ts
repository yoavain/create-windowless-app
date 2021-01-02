import { parseCommand } from "../src/cliParser";
import { v4 as uuid } from "uuid";

describe("Test cliParser", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it("should parse default flags", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --skip-install", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--skip-install"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toEqual(true);
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --no-typescript", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--no-typescript"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(false);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --no-husky", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--no-husky"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(false);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --verbose", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--verbose"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toEqual(true);
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --icon", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--icon", "someIcon"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toEqual("someIcon");
        expect(command.nodeVersion).toBeUndefined();
    });

    it("should parse flags: --node-version", async () => {
        const sandbox: string = uuid();

        const { projectName, command } = parseCommand(["node.exe", "dummy.ts", sandbox, "--node-version", "12.12.0"]);

        expect(projectName).toEqual(sandbox);
        expect(command.interactive).toBeUndefined();
        expect(command.verbose).toBeUndefined();
        expect(command.typescript).toEqual(true);
        expect(command.husky).toEqual(true);
        expect(command.skipInstall).toBeUndefined();
        expect(command.icon).toBeUndefined();
        expect(command.nodeVersion).toEqual("12.12.0");
    });

    it("should print help with flags: --help", async () => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
        const sandbox: string = uuid();

        parseCommand(["node.exe", "dummy.ts", sandbox, "--help"]);

        expect(mockExit).toHaveBeenCalledWith(0);
        expect(mockStdout.mock.calls[0][0]).toMatchSnapshot("help-stdout");
    });

    it("should error on missing project name", async () => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => {});

        const { projectName } = parseCommand(["node.exe", "dummy.ts"]);

        expect(projectName).toBeUndefined();
        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockStdout.mock.calls[0][0]).toMatchSnapshot("missing-project-name-stdout");
    });
});