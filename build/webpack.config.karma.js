const { resolve } = require('path')

module.exports = {
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.vue', '.jsx'],
    alias: {
      src: resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        use: 'babel-loader',
        include: [
          resolve(__dirname, '../src'),
          resolve(__dirname, '../test'),
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader',
          },
        },
      },
    ],
  },
  devtool: '#inline-source-map',
}
