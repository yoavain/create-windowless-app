// Mocks should be first
const mockCopyFolderRecursiveSync = jest.fn();
const mockCopyFileSync = jest.fn();

jest.mock("../../src/files", () => ({
    copyFolderRecursiveSync: mockCopyFolderRecursiveSync
}));
jest.mock("fs", () => ({
    copyFileSync: mockCopyFileSync
}));

// Imports should be after mocks
import { FileManager } from "../../src/files/fileManager";
import path from "path";

describe("FileManager.copyTemplate", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("TypeScript mode: calls copyFolderRecursiveSync 3 times with correct dirs", () => {
        const fm = new FileManager({ targetRoot: "/target", appName: "my-app", typeScript: true });
        fm.copyTemplate();

        expect(mockCopyFolderRecursiveSync).toHaveBeenCalledTimes(3);
        const calls = mockCopyFolderRecursiveSync.mock.calls;
        expect(calls[0][0]).toMatch(/[/\\]common$/);
        expect(calls[1][0]).toMatch(/[/\\]typescript$/);
        expect(calls[2][0]).toMatch(/[/\\]launcher$/);
    });

    it("JavaScript mode: calls copyFolderRecursiveSync 3 times with javascript dir", () => {
        const fm = new FileManager({ targetRoot: "/target", appName: "my-app", typeScript: false });
        fm.copyTemplate();

        expect(mockCopyFolderRecursiveSync).toHaveBeenCalledTimes(3);
        const calls = mockCopyFolderRecursiveSync.mock.calls;
        expect(calls[0][0]).toMatch(/[/\\]common$/);
        expect(calls[1][0]).toMatch(/[/\\]javascript$/);
        expect(calls[2][0]).toMatch(/[/\\]launcher$/);
    });

    it("with --icon: calls copyFileSync once to copy icon into launcher/launcher.ico", () => {
        const fm = new FileManager({ targetRoot: "/target", appName: "my-app", typeScript: true, icon: "/some/icon.ico" });
        fm.copyTemplate();

        expect(mockCopyFileSync).toHaveBeenCalledTimes(1);
        const [src, dest] = mockCopyFileSync.mock.calls[0];
        expect(src).toContain("icon.ico");
        expect(dest).toContain(path.join("launcher", "launcher.ico"));
    });

    it("without --icon: copyFileSync not called", () => {
        const fm = new FileManager({ targetRoot: "/target", appName: "my-app", typeScript: true });
        fm.copyTemplate();

        expect(mockCopyFileSync).not.toHaveBeenCalled();
    });

    it("formatter replaces ##APPNAME## in template strings", () => {
        const fm = new FileManager({ targetRoot: "/target", appName: "my-app", typeScript: true });
        fm.copyTemplate();

        // The formatter passed to copyFolderRecursiveSync should replace ##APPNAME##
        const formatter = mockCopyFolderRecursiveSync.mock.calls[0][2];
        expect(typeof formatter).toBe("function");
        expect(formatter("Hello ##APPNAME##!")).toBe("Hello my-app!");
        expect(formatter("##APPNAME## and ##APPNAME##")).toBe("my-app and my-app");
    });
});
