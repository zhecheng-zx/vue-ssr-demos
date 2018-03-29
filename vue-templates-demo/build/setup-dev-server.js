/**
 * Created by zhangxin on 2017/8/29.
 */
const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {}
}

module.exports = function setupDevServer(app, cb) {
  let bundle, clientManifest
  let resolve
  const readyPromise = new Promise(r => { resolve = r })
  const ready = (...args) => {
    resolve()
    cb(...args)
  }

  // 使用热更新中间件修改客户端配置
  clientConfig.entry.app = ['webpack-hot-middleware/client',clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
  // 开发服务中间件（dev middleware）
  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler,{
    publicPath: clientConfig.output.publicPath,
    noInfo: true
  })
  app.use(devMiddleware)
  clientCompiler.plugin('done', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return

    clientManifest = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json'
    ))
    if (bundle) {
      ready(bundle, {
        clientManifest
      })
    }
  })

  // 热更新中间件
  app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat:5000 }))

  // 监听并修改服务端渲染器
  const serverCompiler =webpack(serverConfig)
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    if (stats.errors.length) return

    // 生成读取包
    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
    if (clientManifest) {
      ready(bundle, {
        clientManifest
      })
    }
  })
  return readyPromise
}
