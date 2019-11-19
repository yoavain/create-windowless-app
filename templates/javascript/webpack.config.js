const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/index.js",
    target: "node",
    output: {
        path: path.join(__dirname, "_build"),
        filename: "index.js"
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: "node_modules/node-notifier/vendor/snoreToast/snoretoast-x64.exe",
                to: "../dist/snoretoast-x64.exe",
                toType: "file"
            },
            {
                from: "resources/bin/<APPNAME>-launcher.exe",
                to: "../dist/<APPNAME>-launcher.exe",
                toType: "file"
            }
        ])
    ],
    devtool: "sourcemap"
};
