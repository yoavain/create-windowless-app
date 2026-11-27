// The same range as "engines" in package.json
const SUPPORTED_RANGE: string = "^22.22.2 || ^24.15.0 || >=26.0.0";

const isSupported = (version: string): boolean => {
    const [major, minor, patch] = version.split(".").map(Number);
    return (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) || (major === 24 && minor >= 15) || major >= 26;
};

export const checkNodeRuntimeVersion = () => {
    const currentNodeVersion: string = process.versions.node;

    if (!isSupported(currentNodeVersion)) {
        console.error(`You are running NodeJS ${currentNodeVersion}.\nCreate Windowless App requires NodeJS ${SUPPORTED_RANGE}.\nPlease update your version of Node.`);
        process.exit(1);
    }
};
