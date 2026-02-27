import type { ProgramConfig } from "../src/cliParser";
import { parseCommand } from "../src/cliParser";
import * as interactive from "../src/interactive";
import { randomUUID as uuid } from "crypto";
import inquirer from "inquirer";
import * as path from "path";

describe("Test cliParser", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Test parseCommand", () => {
        it("should parse default flags", async () => {
            const sandbox: string = uuid();

            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(true);
            expect(husky).toEqual(true);
            expect(icon).toBeUndefined();
        });

        it("should parse flags: --no-typescript", async () => {
            const sandbox: string = uuid();

            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--no-typescript"]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(false);
            expect(husky).toEqual(true);
            expect(icon).toBeUndefined();
        });

        it("should parse flags: --no-husky", async () => {
            const sandbox: string = uuid();

            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--no-husky"]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(true);
            expect(husky).toEqual(false);
            expect(icon).toBeUndefined();
        });

        it("should parse flags: --verbose", async () => {
            const sandbox: string = uuid();

            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--verbose"]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toEqual(true);
            expect(typescript).toEqual(true);
            expect(husky).toEqual(true);
            expect(icon).toBeUndefined();
        });

        it("should parse flags: --icon", async () => {
            const sandbox: string = uuid();

            const iconLocation: string = path.join(__dirname, "..", "templates", "launcher", "launcher.ico");
            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--icon", iconLocation]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(true);
            expect(husky).toEqual(true);
            expect(icon).toEqual(iconLocation);
        });

        it("should error on non existing icon", async () => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation((code: number) => {
                expect(code).toEqual(1);
            });
            // @ts-expect-error -- write overloads require boolean return; mock returns void
            const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });

            const sandbox: string = uuid();

            const iconLocation: string = path.join(__dirname, "..", "templates", "common", "resources", "not-exists.ico");
            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", sandbox, "--icon", iconLocation]);

            expect(projectName).toEqual(sandbox);
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(true);
            expect(husky).toEqual(true);
            expect(icon).toBeUndefined();
            expect(mockStdout.mock.calls[0][0]).toContain("Cannot find icon in");
        });

        it("should print help with flags: --help", async () => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation((code: number) => {
                expect(code).toEqual(0);
            });
            // @ts-expect-error -- write overloads require boolean return; mock returns void
            const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });
            const sandbox: string = uuid();

            await parseCommand(["node.exe", "dummy.ts", sandbox, "--help"]);

            expect(mockStdout.mock.calls[0][0] as string).toContain("Show help");
        });

        it("should error on missing project name", async () => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation((code: number) => {
                expect(code).toEqual(1);
            });
            // @ts-expect-error -- write overloads require boolean return; mock returns void
            const mockStdout = jest.spyOn(process.stdout, "write").mockImplementation(() => { /* do nothing */ });

            await parseCommand(["node.exe", "dummy.ts"]);
            expect(mockStdout.mock.calls[0][0] as string).toContain("Show help");
        });

        it("should not fail if no projectName and interactive", async () => {
            jest.spyOn(interactive, "interactiveMode").mockImplementation(async () => {
                return {
                    projectName: "Test1234",
                    typescript: true,
                    husky: true
                } as ProgramConfig;
            });

            const { projectName, verbose, typescript, husky, icon } = await parseCommand(["node.exe", "dummy.ts", "--interactive"]);

            expect(interactive.interactiveMode).toHaveBeenCalled();
            expect(projectName).toEqual("Test1234");
            expect(verbose).toBeUndefined();
            expect(typescript).toEqual(true);
            expect(husky).toEqual(true);
            expect(icon).toBeUndefined();
        });

        it("should call inquirer in interactive mode", async () => {
            // @ts-expect-error -- prompt has complex generics; mock returns empty object
            jest.spyOn(inquirer, "prompt").mockImplementation(async () => ({}));

            await parseCommand(["node.exe", "dummy.ts", "--interactive"]);

            expect(inquirer.prompt).toHaveBeenCalled();
        });
    });
});
