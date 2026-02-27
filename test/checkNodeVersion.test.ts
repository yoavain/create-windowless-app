import { checkNodeRuntimeVersion } from "../src/checkNodeVersion";

describe("Test checkNodeRuntimeVersion", () => {
    let p;
    beforeEach(() => {
        p = process;
    });
    afterEach(() => {
        jest.restoreAllMocks();
        process = p;
    });


    describe("Test checkNodeRuntimeVersion", () => {
        it("should succeed on allowed version", async () => {
            process = { ...process, versions: { ...process.versions, node :"20.0.0" } };
            checkNodeRuntimeVersion();
        });

        it("should exit with code 1 when version does not meet requirements", async () => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation(() => {});

            process = { ...process, versions: { ...process.versions, node :"10.0.0" } };
            checkNodeRuntimeVersion();
            expect(process.exit).toHaveBeenCalledTimes(1);
            expect(process.exit).toHaveBeenCalledWith(1);
        });
    });
});
