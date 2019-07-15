const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: "production",
	entry: './src/index.js',
	target: 'node',
	output: {
		path: path.join(__dirname, '_build'),
		filename: 'index.js'
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: 'node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe',
				to: '../dist/SnoreToast.exe',
				toType: 'file'
			},
			{
				from: 'resources/bin/<APPNAME>-launcher.exe',
				to: '../dist/launcher.exe',
				toType: 'file'
			}
		])

	],
	devtool: 'sourcemap'
};