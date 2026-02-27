import * as path from "path";

const mockExistsSync = jest.fn((p) => {
    if (p === "target" || p === `target${path.sep}inner1` || p === `target${path.sep}inner2`) {
        return false;
    }
});
const mockLstatSync = jest.fn((p) => {
    const isDirectory: boolean = p === "source" || p === `source${path.sep}inner1` || p === `source${path.sep}inner2`;
    return {
        isDirectory: () => isDirectory
    } as unknown as StatsBase<unknown>;
});
const mockReaddirSync = jest.fn((p) => {
    if (p === "source") {
        return ["inner1", "inner2", "root.json"];
    }
    if (p === `source${path.sep}inner1`) {
        return ["inner.png"];
    }
    return [];
});
const mockReadFileSync = jest.fn(() => "data");
const mockMkdirSync = jest.fn(() => "");
const mockWriteFileSync = jest.fn(() => "");

jest.mock("fs", () => {

    return {
        existsSync: mockExistsSync,
        lstatSync: mockLstatSync,
        mkdirSync: mockMkdirSync,
        writeFileSync: mockWriteFileSync,
        readFileSync: mockReadFileSync,
        readdirSync: mockReaddirSync
    };
});


import { copyFolderRecursiveSync, writeJson } from "../../src/files";
import type { StatsBase } from "fs";
import os from "os";


describe("writeJson", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should write properly formatted JSON with trailing newline", () => {
        const json = { name: "my-app", version: "1.0.0" };
        writeJson("output.json", json);

        expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
        const call = mockWriteFileSync.mock.calls[0] as unknown as [string, string];
        const [fileName, content] = call;
        expect(fileName).toBe("output.json");
        expect(content).toMatch(/^\{/);
        expect(content.endsWith(os.EOL)).toBe(true);
    });

    it("should use OS line endings", () => {
        const json = { key: "value" };
        writeJson("output.json", json);

        const call = mockWriteFileSync.mock.calls[0] as unknown as [string, string];
        const content = call[1];
        expect(content).not.toContain("\n" + os.EOL);
        // All newlines should be os.EOL
        const withoutOsEol = content.split(os.EOL).join("");
        expect(withoutOsEol).not.toContain("\n");
    });
});

describe("Test file utils", () => {
    it("Should copy folders recursively", () => {

        const formatter = jest.fn((data) => `###${data}###`);
        copyFolderRecursiveSync("source", "target", formatter);

        expect(mockExistsSync).toHaveBeenCalledTimes(5);
        expect(mockExistsSync.mock.calls[0]).toEqual(["target"]);
        expect(mockExistsSync.mock.calls[1]).toEqual([`target${path.sep}inner1`]);
        expect(mockExistsSync.mock.calls[2]).toEqual([`target${path.sep}inner1${path.sep}inner.png`]);
        expect(mockExistsSync.mock.calls[3]).toEqual([`target${path.sep}inner2`]);
        expect(mockExistsSync.mock.calls[4]).toEqual([`target${path.sep}root.json`]);

        expect(mockLstatSync).toHaveBeenCalledTimes(7);
        expect(mockLstatSync.mock.calls[0]).toEqual(["source"]);
        expect(mockLstatSync.mock.calls[1]).toEqual([`source${path.sep}inner1`]);
        expect(mockLstatSync.mock.calls[2]).toEqual([`source${path.sep}inner1`]);
        expect(mockLstatSync.mock.calls[3]).toEqual([`source${path.sep}inner1${path.sep}inner.png`]);
        expect(mockLstatSync.mock.calls[4]).toEqual([`source${path.sep}inner2`]);
        expect(mockLstatSync.mock.calls[5]).toEqual([`source${path.sep}inner2`]);
        expect(mockLstatSync.mock.calls[6]).toEqual([`source${path.sep}root.json`]);

        // 3 folders read
        expect(mockReaddirSync).toHaveBeenCalledTimes(3);
        expect(mockReaddirSync.mock.calls[0]).toEqual(["source"]);
        expect(mockReaddirSync.mock.calls[1]).toEqual([`source${path.sep}inner1`]);
        expect(mockReaddirSync.mock.calls[2]).toEqual([`source${path.sep}inner2`]);

        // 3 folders created
        expect(mockMkdirSync).toHaveBeenCalledTimes(3);
        expect(mockMkdirSync.mock.calls[0]).toEqual(["target"]);
        expect(mockMkdirSync.mock.calls[1]).toEqual([`target${path.sep}inner1`]);
        expect(mockMkdirSync.mock.calls[2]).toEqual([`target${path.sep}inner2`]);

        // 2 files read
        expect(mockReadFileSync).toHaveBeenCalledTimes(2);
        expect(mockReadFileSync.mock.calls[0]).toEqual([`source${path.sep}inner1${path.sep}inner.png`]);
        expect(mockReadFileSync.mock.calls[1]).toEqual([`source${path.sep}root.json`, { encoding: "utf8" }]);

        // 2 files copied
        expect(mockWriteFileSync).toHaveBeenCalledTimes(2);
        expect(mockWriteFileSync.mock.calls[0]).toEqual([`target${path.sep}inner1${path.sep}inner.png`, "data"]);
        expect(mockWriteFileSync.mock.calls[1]).toEqual([`target${path.sep}root.json`, "###data###", { encoding: "utf8" }]);

        expect(formatter).toHaveBeenCalledTimes(1);
        expect(formatter.mock.calls[0]).toEqual(["data"]);
    });
});
