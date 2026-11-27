// The "engines" range of node-notifier
const SUPPORTED_RANGE = "^22.22.2 || ^24.15.0 || >=26.0.0";

const isSupported = (version) => {
    const [major, minor, patch] = version.split(".").map(Number);
    return (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) || (major === 24 && minor >= 15) || major >= 26;
};

export const checkNodeRuntimeVersion = () => {
    const currentNodeVersion = process.versions.node;

    if (!isSupported(currentNodeVersion)) {
        console.error(`You are running Node.js ${currentNodeVersion}.\nYou need Node.js ${SUPPORTED_RANGE}.\nPlease update your version of Node.`);
        process.exit(1);
    }
};
