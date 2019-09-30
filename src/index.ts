#!/usr/bin/env node

'use strict';

import { createWindowlessApp } from './createWindowlessApp';
import { checkCscInPath } from "../templates/typescript/src/launcherCompiler";

const currentNodeVersion: string = process.versions.node;
const semver: string[] = currentNodeVersion.split('.');
const major: number = Number(semver[0]);

if (isNaN(major) || major < 8) {
    console.error(`You are running Node ${currentNodeVersion}.\nCreate Windowless App requires Node 8 or higher.\nPlease update your version of Node.`);
    process.exit(1);
}

// Check for csc.exe in %PATH%
checkCscInPath()
    .then(exist => {
        if (exist) {
            // noinspection JSIgnoredPromiseFromCall
            createWindowlessApp();
        }
        else {
            console.error(`You need "csc.exe" (C# compiler) in your path in order to compile the launcher.exe.`);
            process.exit(1);
        }
    });
