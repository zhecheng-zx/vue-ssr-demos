/**
 * Created by zhangxin on 2017/8/29.
 */
const glob = require('glob')
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
  entry:{
    app: './src/entry-client.js'
  },
  resolve: {
    alias: {
      'create-api': './create-api-client.js'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // 如果一个模块被抽取到公共模块里
        return (
          /node_modules/.test(module.context) &&
            !/\.css$/.test(module.request)
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new VueSSRClientPlugin()
  ]
})

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new SWPrecachePlugin({
      cacheId: 'vue-ssr-template',
      filename: 'service-worker.js',
      minify: true,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst'
        }
        // {
        //   urlPattern: /\/(top|new|show|ask|jobs)/,
        //   handler: 'networksFirst'
        // },
        // {
        //   urlPattern: '/item/:id',
        //   handler: 'networksFirst',
        // },
        // {
        //   urlPattern: '/user/:id',
        //   handler: 'networkFirst'
        // }
      ]
    })
  )
}

module.exports = config
