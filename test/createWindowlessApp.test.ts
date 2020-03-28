// Mocks Should be first
import mockSpawn from "mock-spawn";
// Imports should be after mocks
import { createWindowlessApp } from "../src/createWindowlessApp";
import { v4 as uuid } from "uuid";

process.chdir = jest.fn();

jest.setTimeout(15000);

jest.mock("fs-extra", () => {
    return {
        ensureDirSync: jest.fn(),
        readdirSync: jest.fn(() => []),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => "{}"),
        copyFileSync: jest.fn(),
        pathExistsSync: jest.fn()
    };
});
jest.mock("envinfo", () => {
    return {
        run: () => Promise.resolve({})
    };
});
const mySpawn = mockSpawn();
require("child_process").spawn = mySpawn;

describe("Test createWindowlessApp", () => {
    it("should create a prototype project with default flags", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox]);
    });

    it("should create a prototype project with flags: --skip-install", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--skip-install"]);
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

    it("should create a prototype project with flags: --node-version", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--node-version", "12.12.0"]);
    });

    it("should print info with flags: --info", async () => {
        await createWindowlessApp(["node.exe", "dummy.ts", "--info"]);
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
