// Mocks Should be first
jest.mock("child_process", () => ({
    spawnSync: (command: string) => {
        if (command === "npm config list") {
            return { status: 0, output: [`; cwd = ${process.cwd()}`] };
        }
        else {
            return { status: 0 };
        }
    }
}));

const mockFsRmSync = jest.fn();
jest.mock("fs", () => {
    return {
        existsSync: jest.fn(() => true),
        lstatSync: jest.fn(() => ({ isDirectory: () => true })),
        mkdirSync: jest.fn(),
        readdirSync: jest.fn(() => []),
        rmSync: mockFsRmSync,
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(() => "{}"),
        copyFileSync: jest.fn(),
        promises: {
            access: jest.fn(() => Promise.resolve())
        }
    };
});

const mockInstallAll = jest.fn(() => Promise.resolve());
jest.mock("../src/dependencies", () => ({
    DependenciesManager: jest.fn().mockImplementation(() => ({
        installAll: mockInstallAll
    }))
}));

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

    it("should create a prototype project with flags: --verbose", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--verbose"]);
    });

    it("should create a prototype project with flags: --icon", async () => {
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--icon", "someIcon"]);
    });

    it("should print help with flags: --help", async () => {
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(0);
        });
        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox, "--help"]);
    });

    it("should error with missing project name", async () => {
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        jest.spyOn(process, "exit").mockImplementation((code: number) => {
            expect(code).toEqual(1);
        });
        await createWindowlessApp(["node.exe", "dummy.ts"]);
    });

    it("should call process.exit(1) and clean up dir when installAll rejects", async () => {
        mockInstallAll.mockRejectedValueOnce({ command: "npm install" });
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        jest.spyOn(process, "exit").mockImplementation(() => {});

        const sandbox: string = uuid();
        await createWindowlessApp(["node.exe", "dummy.ts", sandbox]);

        expect(process.exit).toHaveBeenCalledWith(1);
        // readdirSync returns [] so the dir is empty → rmSync called to delete root
        expect(mockFsRmSync).toHaveBeenCalled();
    });
});
