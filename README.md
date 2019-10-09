# Create Windowless App ![node](https://img.shields.io/node/v/create-windowless-app.svg) ![types](https://img.shields.io/npm/types/typescript.svg) ![commit](https://img.shields.io/github/last-commit/yoavain/create-windowless-app.svg) ![license](https://img.shields.io/npm/l/create-windowless-app.svg) [![Known Vulnerabilities](https://snyk.io//test/github/yoavain/create-windowless-app/badge.svg?targetFile=package.json)](https://snyk.io//test/github/yoavain/create-windowless-app?targetFile=package.json) ![dependabot](https://api.dependabot.com/badges/status?host=github&repo=yoavain/create-windowless-app)
Create a windowless NodeJS app.

Create Windowless App works on Windows 64-bit only<br>
If something doesn't work, please [file an issue](https://github.com/yoavain/create-windowless-app/issues/new). 


Pre-Requisites:
* csc.exe (C# compiler) in the PATH environment variable

## Quick Overview

```sh
npx create-windowsless-app my-app
```

<details><summary>Or with npm</summary>
<p>
You can install create-windowsless-app globally:

```sh
npm install -g create-windowsless-app
```

And then you can run:
```
create-windowless-app my-app
```
</p>
</details>

<p align='center'>
<img src='https://raw.githubusercontent.com/yoavain/create-windowless-app/master/resources/docs/usage.gif' width='957' alt='npx create-windowless-app my-app'>
</p>

Or in interactive mode:
```
npx create-windowless-app --interactive
```

<p align='center'>
<img src='https://raw.githubusercontent.com/yoavain/create-windowless-app/master/resources/docs/interactive.gif' width='957' alt='npx create-windowless-app --interactive'>
</p>


## Project Structure

create-windowless-app creates the following files:
```
my-app
├── node_modules
├── package.json
├── tsconfig.json
├── webpack.config.js
├── launcher
│   ├── launcher.cs
|   ├── launcher.ico
|   └── launcherCompiler.ts
├── resources
│   └── bin
│       └── my-app-launcher.exe
└───src
    └── index.js
```

No configuration or complicated folder structures, just the files you need to build your app.<br>

Once the installation is done, you can build the project
```
cd my-app
npm run build
```

Then you can find in your my-app\dist folder the following files:
<p>
<img src='https://raw.githubusercontent.com/yoavain/create-windowless-app/master/resources/docs/dist.png' width='157' alt='dist files'>
</p>

* *my-app.exe* is the compiled app, with NodeJS bundled (using [nexe](https://github.com/nexe/nexe))
* *my-app-launcher.exe* is the compiled launcher.cs file that executes my-app.exe without a console window
* *snoretoast-x64.exe* allows windows notification (using [node-notifier](https://github.com/mikaelbr/node-notifier))
* *my-app.log* will be generated on first run (using [winston logger](https://github.com/winstonjs/winston))

## create-windowless-app CLI

```
create-windowless-app <project-directory> [options]

Options:
    --no-typescript                 use javascript rather than typescript
    --no-husky                      do not install husky pre-commit hook for building launcher
    --skip-install                  writes dependencies to package.json without installing them
    --icon <icon>                   override default launcher icon file
    --node-version <nodeVersion>    override node version to bundle

    --interactive                   interactive mode

Only <project-directory> is required.
```

## Why?

NodeJS does not have a native windowless mode (like java has javaw).
Sometimes, you want to run an app as a scheduled task that runs in the background, or run a long task (i.e. a server) but do not want a console that must always be open.
Best solution I could find is using a script that executes the NodeJS in windowless mode

This package comes to do the following:
1) Compile a NodeJS (javascript/typescript) project into an *.exe file bundled with NodeJS, so no installation is needed
2) Compile a C# launcher that executes the compiled project, in windowless mode

## Template project

The "Hello World" template is a POC containing 2 features you might want when running a windowless app:
1) Logger
2) Notifications

The template project build script does the following things
1) Compiles TypeScript to JavaScript (if in a TypeScript template)
2) Runs WebPack to bundle all JavaScript into a single file, and copy binary files into the "dist" folder
3) Runs nexe to compile the single WebPack JavaScript output file to an exe file bundled with NodeJS (currently, latest NodeJS version is bundled) 

