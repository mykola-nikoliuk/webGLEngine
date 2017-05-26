var path = require('path');

module.exports = {
  entry: './source/WebGLEngine.ts',
  output: {
    filename: 'WebGLEngine.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve(__dirname, 'source')
    ],
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'awesome-typescript-loader'
    }, {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'source-map-loader'
    }]
  }
};
