module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: "test\/.*.test.ts$",
    moduleFileExtensions: [
        "ts",
        "js",
        "json",
        "node"
    ],
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/index.ts",
        "!**/node_modules/**"
    ]
};
