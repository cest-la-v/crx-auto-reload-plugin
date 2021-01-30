const path = require('path');
const pack = require('./package.json');
const rootDir = path.resolve(__dirname, '..');

module.exports = {
  mode: 'none',
  target: 'node',
  entry: './src/index.ts',
  // devtool: 'source-map',
  output: {
    publicPath: '.',
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    mainFiles: ['index'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.ejs', '.ets', '.json'],
  },
  externals: {
    subtract: Object.keys(pack.dependencies),
  },
  module: {
    rules: [
      {
        test: /\.(e?tsx?|e?jsx?)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: path.join(rootDir, 'src'),
        exclude: /node_modules/,
      },
      {
        test: /\.e?tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(e?tsx?|e?jsx?)$/,
        type: 'asset/source',
        exclude: /node_modules/,
      },
    ],
  },
};
