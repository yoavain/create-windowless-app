import { checkCscInPath, compileLauncher } from "./launcherCompiler";

// Check for csc.exe in %PATH%
checkCscInPath()
    .then(exist => {
        if (exist) {
            const [sourceLocation, outputLocation, iconLocation]: string[] = process.argv;
            compileLauncher(sourceLocation, outputLocation, iconLocation)
                .then();
        }
        else {
            console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
            process.exit(1);
        }
    });
