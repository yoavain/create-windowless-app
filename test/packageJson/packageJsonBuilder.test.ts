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
    it("Test package.json with husky", () => {
        const builder = new PackageJsonBuilder("test-app").withHusky();
        expect(builder.build()).toMatchSnapshot();
    });
    it("Test package.json with javascript after husky", () => {
        const builder = new PackageJsonBuilder("test-app").withHusky().withJavaScript();
        expect(builder.build()).toMatchSnapshot();
    });
    it("Test package.json with husky after javascript", () => {
        const builder = new PackageJsonBuilder("test-app").withJavaScript().withHusky();
        expect(builder.build()).toMatchSnapshot();
    });
});
