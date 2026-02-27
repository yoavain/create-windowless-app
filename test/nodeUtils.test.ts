// Mocks should be first
const mockSpawnSync = jest.fn();

jest.mock("child_process", () => ({
    spawnSync: mockSpawnSync
}));

// Imports should be after mocks
import { checkThatNpmCanReadCwd } from "../src/nodeUtils";

describe("checkThatNpmCanReadCwd", () => {
    const cwd = process.cwd();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return true when npm cwd matches process.cwd()", () => {
        mockSpawnSync.mockReturnValue({
            status: 0,
            output: [`; cwd = ${cwd}`]
        });

        expect(checkThatNpmCanReadCwd()).toBe(true);
    });

    it("should return false when npm cwd differs from process.cwd()", () => {
        mockSpawnSync.mockReturnValue({
            status: 0,
            output: ["; cwd = C:\\some\\other\\path"]
        });

        expect(checkThatNpmCanReadCwd()).toBe(false);
    });

    it("should return false when spawnSync returns non-zero status", () => {
        mockSpawnSync.mockReturnValue({
            status: 1,
            output: []
        });

        expect(checkThatNpmCanReadCwd()).toBe(false);
    });

    it("should return true (graceful fallback) when output has no '; cwd =' line", () => {
        mockSpawnSync.mockReturnValue({
            status: 0,
            output: ["some other output"]
        });

        expect(checkThatNpmCanReadCwd()).toBe(true);
    });

    it("should return false when spawnSync throws", () => {
        mockSpawnSync.mockImplementation(() => {
            throw new Error("spawn error");
        });

        expect(checkThatNpmCanReadCwd()).toBe(false);
    });
});
