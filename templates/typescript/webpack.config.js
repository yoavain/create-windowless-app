const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: "production",
    entry: './_compile/index.js',
    target: 'node',
    output: {
        path: path.join(__dirname, '_build'),
        filename: 'index.js'
    },
    plugins: [
		new CleanWebpackPlugin()
    ],
    devtool: 'sourcemap'
};