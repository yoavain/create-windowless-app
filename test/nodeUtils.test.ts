import { checkNodeVersion } from "../src/nodeUtils";

describe("Test checkNodeVersion", () => {
    it("test checkNodeVersion - available", async () => {
        const version: string = await checkNodeVersion("12.9.1");
        expect(version).toEqual("windows-x64-12.9.1");
    });
    it("test checkNodeVersion - not available", async () => {
        const version: string = await checkNodeVersion("12.11.0");
        expect(version).toBeDefined();
    });
    it("test checkNodeVersion - not given", async () => {
        const version: string = await checkNodeVersion();
        expect(version).toBeDefined();
    });
});
