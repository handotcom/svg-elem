const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin') // https://github.com/jantimon/html-webpack-plugin#options

// const htmlWebpackPlugin = new HtmlWebpackPlugin({
// 	template: path.join(__dirname, 'examples/src/index.html'), 
// 	filename: './index.html', // Automatically inject a script reference to the bundle output in 
// })


const exampleNames = fs.readdirSync('./examples').filter((folderName)=>{
	return !~['dist'].indexOf(folderName)
})

const oWebpackEntries = {}
const arrHtmlWebpackPlugins = []
exampleNames.forEach((name)=>{
	oWebpackEntries[name] = path.join(__dirname,`examples/${name}`)
	arrHtmlWebpackPlugins.push(
		new HtmlWebpackPlugin({
			// inject: true,
			template: path.join(__dirname, `examples/${name}/index.html`),
			// filename: path.join(__dirname, `examples/${name}/index.html`),
			filename: `${name}.html`,
			chunks: [name], // specify chunks other wise all scripts will be added to every html
			// path: path.join(__dirname, 'examples/dist'),
		})
	)	
})

module.exports = {
	entry: oWebpackEntries,
	// entry: path.join(__dirname, 'examples/src/index.js'), // Resolve source dependencies using examples/src/index.js as a starting point
	output: {
		path: path.join(__dirname, 'examples/dist'),
		filename: '[name].bundle.js'
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
	plugins: arrHtmlWebpackPlugins,
	resolve: {
		extensions: ['.js']
	},
	devServer: {
		contentBase: path.join(__dirname, 'examples'),
		port: 3001 // Serve the demo on port localhost:3001
	}
}