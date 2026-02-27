// Mocks should be first
const mockSpawnSync = jest.fn(() => ({ status: 0 }));

jest.mock("child_process", () => ({
    spawnSync: mockSpawnSync
}));

// Imports should be after mocks
import { DependenciesManager } from "../../src/dependencies/dependenciesManager";
import { consts } from "../../src/consts";

describe("DependenciesManager", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("JavaScript project: installs base deps and base devDeps (no TS deps)", async () => {
        const dm = new DependenciesManager(false);
        await dm.installAll();

        expect(mockSpawnSync).toHaveBeenCalledTimes(2);

        const depsCall: string = (mockSpawnSync.mock.calls[0] as string[])[0];
        const devDepsCall: string = (mockSpawnSync.mock.calls[1] as string[])[0];

        for (const dep of consts.dependencies) {
            expect(depsCall).toContain(dep);
        }
        for (const dep of consts.devDependencies) {
            expect(devDepsCall).toContain(dep);
        }
        for (const dep of consts.tsDevDependencies) {
            expect(devDepsCall).not.toContain(dep);
        }
    });

    it("TypeScript project: installs base deps, base devDeps, and tsDevDependencies", async () => {
        const dm = new DependenciesManager(true);
        await dm.installAll();

        expect(mockSpawnSync).toHaveBeenCalledTimes(2);

        const devDepsCall: string = (mockSpawnSync.mock.calls[1] as string[])[0];

        for (const dep of consts.tsDevDependencies) {
            expect(devDepsCall).toContain(dep);
        }
    });

    it("install failure: installAll rejects with { command }", async () => {
        mockSpawnSync.mockReturnValueOnce({ status: 1 });

        const dm = new DependenciesManager(false);
        await expect(dm.installAll()).rejects.toMatchObject({ command: expect.stringContaining("npm install") });
    });

    it("verbose mode: npm command includes --verbose", async () => {
        const dm = new DependenciesManager(false);
        await dm.installAll(true);

        for (const call of mockSpawnSync.mock.calls as string[][]) {
            expect(call[0]).toContain("--verbose");
        }
    });
});
