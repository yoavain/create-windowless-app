import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testEnvironment: "node",
    restoreMocks: true,
    testRegex: "(test|integration_test)/.*.test.ts$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    maxWorkers: "50%",
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: [
        "text",
        "text-summary",
        "json",
        "lcov",
        "clover"
    ],
    collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!**/node_modules/**"]
};

export default config;
