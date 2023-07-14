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
      * `buildPacakgeJson`
        * build package.json file
      * `savePacakgeJson`
        * save package.json file
      * `installDependencies`
        * install dependencies
      * `installDevDependencies`
        * install devDependencies
      * `copyCommonFiles`
        * copy common files
      * `copyTypeScriptFiles`
        * copy typeScript files
      * `copyJavaScriptFiles`
        * copy javaScript files
      * `copyOptional`
        * copy husky
        * copy icon
      * `createResourcesBin`
      * `compileLauncher`
        * runs compiler
      * change dir back
