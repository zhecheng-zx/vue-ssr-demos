const path = require('path')
const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorPlugin = require('friendly-errors-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

function resolve (dir) {
  return path.resolve(__dirname, '..', dir)
}

module.exports = {
  devtool: isProd
    ? false
    : '#cheap-module-source-map',
  output: {
    path: resolve('dist'),
    publicPath: '/dist/',
    filename: 'js-web/[name].[chunkhash].js',
  },
  resolve: {
    alias: {
      'public': resolve('public'),
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    },
    symlinks: false
  },
  module: {
    noParse: /es6-promise\.js$/,
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]?[hash:7]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext].[hash:7]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: isProd
          ? ExtractTextPlugin.extract({
            use: 'css-loader?minimize',
            fallback: 'vue-style-loader'
          })
          : ['vue-style-loader','css-loader']
      },
      {
          test: /\.scss$/,
          use: isProd
          ? ExtractTextPlugin.extract({
            use: 'sass-loader?minimize',
            fallback: 'vue-style-loader'
          })
          : ['vue-style-loader','sass-loader']
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' :false
  },
  plugins: isProd
    ? [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      }),
      new ExtractTextPlugin({
        filename: 'common.[chunkhash].css'
      })
    ]
    : [
      new FriendlyErrorPlugin()
    ]
}
