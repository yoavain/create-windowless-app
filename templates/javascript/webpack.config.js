const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	target: 'node',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'index.js'
	},
	plugins: [
		new CleanWebpackPlugin()
	],
	devtool: 'sourcemap'
};