const MIN_MAJOR_VERSION = 20;
const MIN_MINOR_VERSION = 0;

export const checkNodeRuntimeVersion = () => {
    const currentNodeVersion: string = process.versions.node;
    const semver: string[] = currentNodeVersion.split(".");
    const major: number = Number(semver[0]);
    const minor: number = Number(semver[1]);

    if (Number.isNaN(major) || Number.isNaN(minor) || major < MIN_MAJOR_VERSION || (major === MIN_MAJOR_VERSION && minor < MIN_MINOR_VERSION)) {
        console.error(`You are running Node.js ${currentNodeVersion}.\nYou need at ${MIN_MAJOR_VERSION}.${MIN_MINOR_VERSION} or higher.\nPlease update your version of Node.`);
        process.exit(1);
    }
};
