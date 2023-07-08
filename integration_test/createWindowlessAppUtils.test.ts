import { isSafeToCreateProjectIn } from "../src/createWindowlessAppUtils";
import { dir } from "tmp-promise";
import path from "path";
import { promises as fs } from "fs";

describe("Test createWindowlessAppUtils", () => {
    describe("Test isSafeToCreateProjectIn", () => {
        it ("Should return true on an empty folder", async () => {
            const d = await dir();
            try {
                const safe: boolean = isSafeToCreateProjectIn(d.path, "test-1234");
                expect(safe).toBe(true);
            }
            finally {
                if (d?.cleanup) {
                    await d.cleanup();
                }
            }
        });
        it ("Should return true on a folder with previous log file", async () => {
            const d = await dir();
            try {
                await fs.writeFile(path.join(d.path, "npm-debug.log"), "old log", { encoding: "utf-8" });
                const safe: boolean = isSafeToCreateProjectIn(d.path, "test-1234");
                expect(safe).toBe(true);
            }
            finally {
                if (d?.cleanup) {
                    await d.cleanup();
                }
            }
        });
        it ("Should return true on a folder with a file in it", async () => {
            const d = await dir();
            const existingFile = path.join(d.path, "package.json");
            try {
                await fs.writeFile(existingFile, "{}", { encoding: "utf-8" });
                const safe: boolean = isSafeToCreateProjectIn(d.path, "test-1234");
                expect(safe).toBe(false);
            }
            finally {
                await fs.unlink(existingFile);
                if (d?.cleanup) {
                    await d.cleanup();
                }
            }
        });
    });
});