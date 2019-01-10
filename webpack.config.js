const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlWebpackPlugin = new HtmlWebpackPlugin({
	template: path.join(__dirname, 'examples/src/index.html'), 
	filename: './index.html', // Automatically inject a script reference to the bundle output in 
})

module.exports = {
	entry: path.join(__dirname, 'examples/src/index.js'), // Resolve source dependencies using examples/src/index.js as a starting point
	output: {
		path: path.join(__dirname, 'examples/dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [ 
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			// {
			// 	test: /\.m?js$/,
			// 	exclude: /node_modules/,
			// 	use: { // Use Babel to transpile .js via babel-loader
			// 		loader: 'babel-loader',
			// 	}
			// }
		]
	},
	plugins: [ htmlWebpackPlugin ],
	resolve: {
		extensions: ['.js']
	},
	devServer: {
		port: 3001 // Serve the demo on port localhost:3001
	}
}