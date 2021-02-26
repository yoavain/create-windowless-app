import * as nodeUtils from "../src/nodeUtils";

describe("Test nodeUtils", () => {
    describe("Test getWindowsReleases", () => {
        it("Check getWindowsReleases - online", async () => {
            const release = new Set<string>(await nodeUtils.getWindowsReleases());
            expect(release).toContain("windows-x64-6.17.1");
            expect(release).toContain("windows-x64-8.16.0");
            expect(release).toContain("windows-x64-10.16.0");
            expect(release).toContain("windows-x64-12.18.2");
            expect(release).toContain("windows-x64-14.5.0");
        });
    });
    
    describe("Test checkNodeVersion", () => {
        beforeEach(() => {
            jest.spyOn(nodeUtils, "getWindowsReleases").mockImplementation(async () => {
                return [
                    "windows-x64-10.16.0",
                    "windows-x64-12.18.2",
                    "windows-x64-14.5.0",
                    "windows-x64-15.2.0",
                    "windows-x64-6.17.1",
                    "windows-x64-8.16.0"
                ];
            });
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        
        it("test checkNodeVersion - available", async () => {
            const version: string = await nodeUtils.checkNodeVersion("12.18.2");
            expect(version).toEqual("windows-x64-12.18.2");
        });
        it("test checkNodeVersion - not available", async () => {
            const version: string = await nodeUtils.checkNodeVersion("12.20.0");
            expect(version).toEqual("windows-x64-14.5.0");
        });
        it("test checkNodeVersion - not given", async () => {
            const version: string = await nodeUtils.checkNodeVersion();
            expect(version).toEqual("windows-x64-14.5.0");
        });
        it("test checkNodeVersion - reject 15.x versions", async () => {
            const version: string = await nodeUtils.checkNodeVersion("15.2.0");
            expect(version).toBeDefined();
            expect(version).toEqual("windows-x64-14.5.0");
        });
    });
});
