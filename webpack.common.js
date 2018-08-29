const path = require('path');

module.exports = {
  entry: ['@babel/polyfill','./src/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  module: {
    rules: [
      // {
      //   test: /\.json$/,
      //   exclude: /(node_modules|bower_compontents)/,
      //   use: ['json-loader']
      // },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_compontents)/,
        use: {
          loader:'babel-loader',
        }
      }]
  }
};
