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
          test: /\.(jpg|png|gif|svg|pdf|ico)$/,
          use: [
              {
                  loader: 'file-loader',
                  options: {
                      name: '[path][name].[ext]'
                  },
              },
          ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_compontents)/,
        use: {
          loader:'babel-loader',
        }
      }]
  }
};
