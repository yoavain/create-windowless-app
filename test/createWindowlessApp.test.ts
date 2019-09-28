import { checkNodeVersion } from "../src/createWindowlessApp";

describe('Test createWindowlessApp', () => {
    it("test checkNodeVersion - available", () => {
        return checkNodeVersion("12.9.1")
            .then((version: string) => {
                expect(version).toEqual("windows-x64-12.9.1");
            })
    });
    it("test checkNodeVersion - not available", () => {
        return checkNodeVersion("12.11.0")
            .then((version: string) => {
                expect(version).toBeDefined();
            })
    });
    it("test checkNodeVersion - not given", () => {
        return checkNodeVersion()
            .then((version: string) => {
                expect(version).toBeDefined();
            })
    })
});