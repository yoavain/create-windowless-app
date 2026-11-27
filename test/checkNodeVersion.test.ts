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
        it.each(["22.22.2", "22.23.0", "24.15.0", "24.19.0", "26.0.0", "27.1.0"])("should succeed on allowed version %s", (version: string) => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation(() => {});

            process = { ...process, versions: { ...process.versions, node: version } };
            checkNodeRuntimeVersion();
            expect(process.exit).not.toHaveBeenCalled();
        });

        it.each(["20.19.0", "22.22.1", "23.11.0", "24.14.1", "25.9.0"])("should exit with code 1 on unsupported version %s", (version: string) => {
            // @ts-expect-error -- process.exit returns never; mock implementation returns void
            jest.spyOn(process, "exit").mockImplementation(() => {});

            process = { ...process, versions: { ...process.versions, node: version } };
            checkNodeRuntimeVersion();
            expect(process.exit).toHaveBeenCalledTimes(1);
            expect(process.exit).toHaveBeenCalledWith(1);
        });
    });
});
