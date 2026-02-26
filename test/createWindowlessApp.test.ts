// Mocks Should be first
jest.mock("child_process", () => ({
    spawnSync: (command: string, args?: ReadonlyArray<string>) => {
        if (command === "npm" && args.length === 2 && args[0] === "config" && args[1] === "list") {
            return { status: 0, output: [`; cwd = ${process.cwd()}`] };
        }
        else {
            return { status: 0 };
        }
    }
}));
jest.mock("fs-extra", () => {
    return {
        existsSync: jest.fn(() => true),
        lstatSync: jest.fn(() => ({ isDirectory: () => true })),
        mkdirSync: jest.fn(),
        ensureDirSync: jest.fn(),
        readdirSync: jest.fn(() => []),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => "{}"),
        copyFileSync: jest.fn(),
        pathExistsSync: jest.fn()
    };
});

// Imports should be after mocks
import { createWindowlessApp } from "../src/createWindowlessApp";
import { randomUUID as uuid } from "crypto";

process.chdir = jest.fn();

jest.setTimeout(15000);

describe("Test createWindowlessApp", () => {
    it("should create a prototype project with default flags", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox]);
    });

    it("should create a prototype project with flags: --no-typescript", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--no-typescript"]);
    });

    it("should create a prototype project with flags: --no-husky", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--no-husky"]);
    });

    it("should create a prototype project with flags: --verbose", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--verbose"]);
    });

    it("should create a prototype project with flags: --icon", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--icon", "someIcon"]);
    });

    it("should print help with flags: --help", async () => {
        // @ts-ignore
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(0);
        });
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--help"]);
    });

    it("should error with missing project name", async () => {
        // @ts-ignore
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(1);
        });
        await createWindowlessApp(["node.exe", "dummy.ts"]);
    });
});
