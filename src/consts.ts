export const consts = {
    dependencies: [
        "node-notifier",
        "winston"
    ],
    devDependencies: [
        "fs-extra",
        "jest",
        "webpack",
        "webpack-cli",
        "copy-webpack-plugin",
        "rimraf",
        "cross-spawn"
    ],
    huskyDependencies: [
        "husky"
    ],
    tsDevDependencies: [
        "@types/jest",
        "@types/node",
        "@tsconfig/node18",
        "@types/node-notifier",
        "@types/winston",
        "ts-loader",
        "ts-node",
        "typescript",
        "@types/cross-spawn"
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
        "webpack.config.js",
        "tsconfig.json",
        "tsconfig.build.json",
        "src",
        "resources",
        "launcher",
        "node_modules"
    ]
};
