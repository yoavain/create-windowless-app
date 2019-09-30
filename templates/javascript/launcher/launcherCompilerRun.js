import { checkCscInPath, compileLauncher } from "./launcherCompiler";

// Check for csc.exe in %PATH%
checkCscInPath()
    .then(exist => {
        if (exist) {
            const [sourceLocation, outputLocation, iconLocation] = process.argv;
            compileLauncher(sourceLocation, iconLocation, outputLocation)
                .then();
        }
        else {
            console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
            process.exit(1);
        }
    });
