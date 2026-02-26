export const consts = {
    dependencies: [
        "node-notifier",
        "winston"
    ],
    devDependencies: [
        "jest",
        "webpack",
        "webpack-cli",
        "copy-webpack-plugin",
        "rimraf",
        "postject"
    ],
    huskyDependencies: [
        "husky"
    ],
    tsDevDependencies: [
        "@types/jest",
        "@types/node",
        "@tsconfig/node20",
        "@types/node-notifier",
        "@types/winston",
        "ts-loader",
        "ts-node",
        "typescript"
    ],
    errorLogFilePatterns: [
        "npm-debug.log"
    ],
    validFiles: [
        ".DS_Store",
        "Thumbs.db",
        ".git",
        ".gitignore",
        ".idea",
        "README.md",
        "LICENSE",
        ".hg",
        ".hgignore",
        ".hgcheck",
        ".npmignore",
        "mkdocs.yml",
        "docs",
        ".travis.yml",
        ".gitlab-ci.yml",
        ".gitattributes"
    ],
    knownGeneratedFiles: [
        "package.json",
        "sea-config.json",
        "webpack.config.js",
        "tsconfig.json",
        "tsconfig.build.json",
        "src",
        "resources",
        "launcher",
        "node_modules"
    ]
};
