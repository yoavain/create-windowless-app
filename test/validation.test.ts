import { validateNodeVersion, validateProjectNameInput } from "../src/validation";

describe("Test validateProjectNameInput", () => {
    it("Should return true on valid name", () => {
        expect(validateProjectNameInput("test-1234")).toBe(true);
    });
    it("Should return error message on invalid name", () => {
        expect(validateProjectNameInput("Test-1234")).toBe("name can no longer contain capital letters");
    });
});

describe("Test validateNodeVersion", () => {
    it("Should return true on valid node version", () => {
        expect(validateNodeVersion("14.19.0")).toBe(true);
    });
    it("Should return error message on invalid node version", () => {
        expect(validateNodeVersion("1.2.3.4.5.6")).toBe("Invalid node version");
    });
});