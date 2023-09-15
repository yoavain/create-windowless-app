* `main`:
  * `checkNodeRuntimeVersion`
    * check node runtime version 
  * `checkMsbuildInPath`
    * check if msbuild.exe is in the path 
  * `createWindowlessApp`
    * parses command line arguments
    * `createApp`
      * check name
      * creates folder
      * writes package.json
      * writes sea-config.json
      * change dir
      * `run`
        * builds dependencies & devDependencies
        * `installs`
          * install dependencies
        * `installs`
          * install devDependencies
        * `buildTypeScriptProject`
          * writes "tsconfig.build.json"
          * writes "tsconfig.json"
          * writes "webpack.config.ts"
          * creates "src" folder
          * writes "src/index.ts"
          * creates "utils" folder
          * writes "utils/checkNodeVersion.ts"
          * builds scripts
          * creates .husky folder
          * writes ".husky/pre-commit"
          * writes scripts to package.json
        * `buildJavaScriptProject`
          * writes "webpack.config.js"
          * creates "src" folder
          * writes "src/index.js"
          * creates "utils" folder
          * writes "utils/checkNodeVersion.js"
          * builds scripts
          * creates .husky folder
          * writes ".husky/pre-commit"
          * writes scripts to package.json
        * creates resources/bin folder
        * `buildLauncher`
          * creates "launcher" folder
          * writes "launcher/launcher.cs"
          * writes "launcher/launcher.csproj"
          * copy file "launcher/launcherCompiler.ts" or "launcher/launcherCompiler.js"
          * if there's an icon, copies "launcher/launcher.ico"
        * `compileLauncher`
          * runs compiler
      * change dir back
