module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    restoreMocks: true,
    testRegex: "test/.*.test.ts$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    verbose: true,
    collectCoverage: true,
    coverageReporters: [
        "text",
        "text-summary",
        "json",
        "lcov",
        "clover"
    ],
    collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!**/node_modules/**"]
};
