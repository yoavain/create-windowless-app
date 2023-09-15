export type Scripts = Record<string, string>

export const getPackageJsonBase = (appName): any => ({
    name: appName,
    version: "0.1.0",
    private: true,
    main: "_build/index.js",
    scripts: {}
});

const getSingleExecutableApplicationsScripts = (appName: string): Scripts => ({
    "prenode-sea:build-blob": "rimraf _blob && mkdir _blob",
    "node-sea:build-blob": "node --experimental-sea-config sea-config.json",
    "node-sea:copy-node": `node -e "require('fs').copyFileSync(process.execPath, 'dist/${appName}.exe')"`,
    "node-sea:unsign": `signtool remove /s dist/${appName}.exe`,
    "node-sea:inject-blob": `postject dist/${appName}.exe NODE_SEA_BLOB _blob\\sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
    "node-sea:sign": `signtool sign /fd SHA256 dist/${appName}.exe`,
    "node-sea": "npm run node-sea:build-blob && npm run node-sea:copy-node && npm run node-sea:unsign && npm run node-sea:inject-blob"
});

export const getTsScripts = (appName: string): Scripts => ({
    "start": "ts-node src/index.ts",
    "type-check": "tsc --build tsconfig.json",
    "prewebpack": "rimraf build && rimraf dist",
    "webpack": "webpack",
    "prebuild": "npm run check-node-version",
    "build": "npm run type-check && npm run webpack && npm run node-sea",
    "check-node-version": "ts-node -e \"require(\"\"./utils/checkNodeVersion\"\").checkNodeRuntimeVersion()\"",
    "check-msbuild": "ts-node -e \"require(\"\"./launcher/launcherCompiler\"\").checkMsbuildInPath(true)\"",
    "rebuild-launcher": "msbuild launcher/launcher.csproj",
    ...getSingleExecutableApplicationsScripts(appName)
});

export const getJsScripts = (appName: string): Scripts => ({
    "start": "node src/index.js",
    "prewebpack": "rimraf build && rimraf dist",
    "webpack": "webpack",
    "prebuild": "npm run check-node-version",
    "build": "npm run webpack && npm run node-sea",
    "check-node-version": "node -e \"require(\"\"./utils/checkNodeVersion\"\").checkNodeRuntimeVersion()\"",
    "check-msbuild": "node -e \"require(\"\"./launcher/launcherCompiler\"\").checkMsbuildInPath(true)\"",
    "rebuild-launcher": "msbuild launcher/launcher.csproj",
    ...getSingleExecutableApplicationsScripts(appName)
});

export const getHuskyScripts = (appName: string): Scripts => ({
    "prepare":"git config --get core.hookspath || husky install",
    "pre-commit": `git diff HEAD --exit-code --stat launcher/* || npm run check-msbuild && npm run rebuild-launcher && git add resources/bin/${appName}-launcher.exe`
});
