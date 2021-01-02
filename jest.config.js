module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    restoreMocks: true,
    testRegex: "test/.*.test.ts$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    verbose: true,
    moduleNameMapper: {
        "^~src/(.*)": "<rootDir>/src/$1",
        "^~test/(.*)": "<rootDir>/test/$1",
        "^~resources/(.*)": "<rootDir>/resources/$1"
    },
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
