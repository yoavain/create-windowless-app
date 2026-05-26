import { readFile, writeFile } from "fs/promises";

const SHEBANG = "#!/usr/bin/env node\n";

const collectBinFiles = (bin: unknown): string[] => {
    if (typeof bin === "string") return [bin];
    if (Array.isArray(bin)) return bin as string[];
    if (bin && typeof bin === "object") return Object.values(bin as Record<string, string>);
    return [];
};

const addShebangToFile = async (file: string): Promise<void> => {
    const content = await readFile(file, "utf8");
    await writeFile(file, SHEBANG + content, "utf8");
};

const addShebang = async (): Promise<void> => {
    const packageJson = JSON.parse(await readFile("./package.json", "utf8"));
    const files = collectBinFiles(packageJson.bin);
    await Promise.all(files.map(addShebangToFile));
};

addShebang().catch((err) => {
    console.error(err);
    process.exit(1);
});
