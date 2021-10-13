import type webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

export const webpackConfig: webpack.Configuration = {
    mode: "production",
    entry: "./src/index.ts",
    target: "node",
    output: {
        path: path.join(__dirname, "_build"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.build.json",
                        transpileOnly: true
                    }
                }],
                exclude: /node_modules/
            }
        ]
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

export default webpackConfig;
