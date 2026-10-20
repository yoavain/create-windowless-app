export const consts = {
    // Pinned to major versions, so a new major release cannot break generated projects
    dependencies: [
        "node-notifier@10",
        "winston@3"
    ],
    devDependencies: [
        "webpack@5",
        "webpack-cli@7",
        "copy-webpack-plugin@14",
        "rimraf@6",
        // Only prereleases exist, and a major range does not match prereleases
        "postject@1.0.0-alpha.6"
    ],
    tsDevDependencies: [
        // Lowest supported Node.js major
        "@types/node@22",
        "@types/node-notifier@8",
        "ts-loader@9",
        "ts-node@10",
        // TypeScript 7 (native port) has no JS compiler API, which ts-node and ts-loader require
        "typescript@6"
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
