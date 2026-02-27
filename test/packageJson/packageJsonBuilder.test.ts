import { PackageJsonBuilder } from "../../src/packageJson";

describe("Test PackageJsonBuilder", () => {
    it("Test default package.json", () => {
        const builder = new PackageJsonBuilder("test-app");
        expect(builder.build()).toMatchSnapshot();
    });
    it("Test package.json with javascript", () => {
        const builder = new PackageJsonBuilder("test-app").withJavaScript();
        expect(builder.build()).toMatchSnapshot();
    });
});
