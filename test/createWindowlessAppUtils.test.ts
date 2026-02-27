const mockReaddirSync = jest.fn(() => [] as string[]);
const mockRmSync = jest.fn();

jest.mock("fs", () => ({
    readdirSync: mockReaddirSync,
    rmSync: mockRmSync
}));

import { replaceAppNamePlaceholder, deleteFilesInDir, checkAppName } from "../src/createWindowlessAppUtils";

describe("replaceAppNamePlaceholder", () => {
    it("should replace ##APPNAME## placeholder", () => {
        expect(replaceAppNamePlaceholder("my-app", "Hello ##APPNAME##!")).toBe("Hello my-app!");
    });

    it("should replace all occurrences", () => {
        expect(replaceAppNamePlaceholder("my-app", "##APPNAME## and ##APPNAME##")).toBe("my-app and my-app");
    });

    it("should return string unchanged when no placeholder", () => {
        expect(replaceAppNamePlaceholder("my-app", "no placeholder here")).toBe("no placeholder here");
    });
});

describe("deleteFilesInDir", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete files matching predicate", () => {
        mockReaddirSync.mockReturnValue(["npm-debug.log", "keep.txt"]);

        deleteFilesInDir("/some/dir", (file) => file.startsWith("npm-debug"));

        expect(mockRmSync).toHaveBeenCalledTimes(1);
        expect(mockRmSync).toHaveBeenCalledWith(expect.stringContaining("npm-debug.log"), { recursive: true, force: true });
    });

    it("should skip files not matching predicate", () => {
        mockReaddirSync.mockReturnValue(["keep.txt"]);

        deleteFilesInDir("/some/dir", (file) => file.startsWith("npm-debug"));

        expect(mockRmSync).not.toHaveBeenCalled();
    });

    it("should call onDelete callback when provided", () => {
        mockReaddirSync.mockReturnValue(["npm-debug.log"]);
        const onDelete = jest.fn();

        deleteFilesInDir("/some/dir", (file) => file.startsWith("npm-debug"), onDelete);

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith("npm-debug.log");
    });

    it("should not throw if onDelete is undefined", () => {
        mockReaddirSync.mockReturnValue(["npm-debug.log"]);

        expect(() => deleteFilesInDir("/some/dir", (file) => file.startsWith("npm-debug"))).not.toThrow();
    });
});

describe("checkAppName", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should pass validation for a valid name", () => {
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

        checkAppName("my-app");

        expect(exitSpy).not.toHaveBeenCalled();
    });

    it("should call process.exit(1) for invalid npm package name", () => {
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

        checkAppName("_InvalidName");

        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should call process.exit(1) if name conflicts with a known dependency", () => {
        // @ts-expect-error -- process.exit returns never; mock implementation returns void
        const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

        checkAppName("webpack");

        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});
