const { spawnSync } = require('child_process');
const npm = require('global-npm');

describe("E2E tests", () => {
    it("Test create windowless app - TypeScript template", () => {

        const child = spawnSync(npm.GLOBAL_NPM_BIN, ['run', 'start:test:typescript'], {
            cwd: process.cwd(),
            env: {
                PATH: process.env.PATH + ";C:\\Program Files\\JetBrains\\JetBrains Rider 2019.1.1\\tools\\MSBuild\\15.0\\Bin\\Roslyn"
            },
            stdio: 'inherit',
            // shell: true
        });

        console.log('error', child.error && child.error.toString());
        console.log('stdout ', child.stdout && child.stdout.toString());
        console.log('stderr ', child.stderr && child.stderr.toString());
    })
});