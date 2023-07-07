import { validateProjectNameInput } from "../src/validation";

describe("Test validateProjectNameInput", () => {
    it("Should return true on valid name", () => {
        expect(validateProjectNameInput("test-1234")).toBe(true);
    });
    it("Should return error message on invalid name", () => {
        expect(validateProjectNameInput("Test-1234")).toBe("name can no longer contain capital letters");
    });
});
