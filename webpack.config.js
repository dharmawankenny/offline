const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const path = require('path');

const html = new HtmlWebpackPlugin({template: './App/index.html'});
const offline = new OfflinePlugin({
  ServiceWorker: {
    events: true
  },
  AppCache: false,
});

module.exports = {
  entry: './App/app.js',
  output: {
    filename: '[name].[hash].js',
    path: path.resolve('./build/'),
  },
  module: {
    loaders: [
      {
        test: /\.js?/,
        exclude: '/node_modules/',
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        include: '/node_modules/',
        loader: 'style-loader!css-loader'
      },
    ],
  },
  plugins: [html, offline],
};