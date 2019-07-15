# Create Windowless App
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

create-windowless-app creates the following files:
```
my-app
├── node_modules
├── package.json
├── webpack.config.js
├── launcher-dist
│   ├── launcher.cs
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

* my-app.exe is the compiled app, with NodeJS bundled (using [nexe](https://github.com/nexe/nexe))
* my-app-launcher is the compiled launcher.cs file that executes my-app.exe without a console window
* SnoreToast.exe allows windows notification (using [node-notifier](https://github.com/mikaelbr/node-notifier))
* my-app.log will be generated on first run (using [winston logger](https://github.com/winstonjs/winston))

## create-windowless-app CLI

```
create-windowless-app <project-directory> [options]

Options:
    --typescript    creates a project with typescript
    --skipInstall   writes dependencies to package.json without installing them

Only <project-directory> is required.
```
