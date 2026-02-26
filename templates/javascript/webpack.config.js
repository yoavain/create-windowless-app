const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/index.js",
    target: "node",
    output: {
        path: path.join(__dirname, "_build"),
        filename: "index.js"
    },
    resolve: {
        extensions: [".js"]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "node_modules/node-notifier/vendor/snoreToast/snoretoast-x64.exe",
                    to: "../dist/snoretoast-x64.exe",
                    toType: "file"
                },
                {
                    from: "resources/bin/##APPNAME##-launcher.exe",
                    to: "../dist/##APPNAME##-launcher.exe",
                    toType: "file"
                }
            ]
        })
    ],
    devtool: "source-map"
};
