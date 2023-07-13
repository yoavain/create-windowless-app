const MIN_MAJOR_VERSION = 20;
const MIN_MINOR_VERSION = 0;

export const checkNodeRuntimeVersion = () => {
    const currentNodeVersion = process.versions.node;
    const semver = currentNodeVersion.split(".");
    const major = Number(semver[0]);
    const minor = Number(semver[1]);

    if (Number.isNaN(major) || Number.isNaN(minor) || major < MIN_MAJOR_VERSION || (major === MIN_MAJOR_VERSION && minor < MIN_MINOR_VERSION)) {
        console.error(`You are running Node.js ${currentNodeVersion}.\nYou need at ${MIN_MAJOR_VERSION}.${MIN_MINOR_VERSION} or higher.\nPlease update your version of Node.`);
        process.exit(1);
    }
};
