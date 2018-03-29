/**
 * Created by zhangxin on 2017/8/29.
 */
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const proxy = require('http-proxy-middleware')

const isProd = process.env.NODE_ENV === 'production'
const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const app = express()
const Log = console

const template = fs.readFileSync(resolve('./index.template.html'), 'utf-8')

function createRenderer (bundle, options) {
  return createBundleRenderer(bundle, Object.assign(options, {
    template,
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    basedir: resolve('./dist'),
    runInNewContext: false
  }))
}

let renderer
let readyPromise
if (isProd) {
  // 在生产环境中:使用构建的服务器包创建服务器渲染器。
  // 服务器包由vue-ssr-webpack插件生成。
  const bundle = require('./dist/vue-ssr-server-bundle.json')
  // 客户端显示是可选的，但它允许渲染器
  // 自动推断预加载/预取链接，并直接添加<script>。
  // 标签用于渲染期间使用的任何请求块，避免异步。
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createRenderer(bundle, {
    clientManifest
  })
} else {
  // 在开发模式：设置开发服务的文件监听和热更新
  // 并创建一个新的渲染器、更新index模版
  readyPromise = require('./build/setup-dev-server')(app, (bundle, options) => {
    renderer = createRenderer(bundle, options)
  })
}


const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(compression({ threshold: 0 }))
app.use(favicon('./public/logo-48.png'))
app.use('/dist', serve('./dist', true))
app.use('/public', serve('./public', true))
app.use('/manifest.json', serve('./manifest.json', true))
app.use('/service-worker.js', serve('./dist/service-worker.js'))

const microCache = LRU({
  max: 100,
  maxAge: 1000
})
// 缓存设置 现在是全部缓存 可以根据需求修改
const isCacheable = req => useMicroCache

function render (req, res) {
  const s = Date.now();

  res.setHeader("Content-Type", "text/html")
  res.setHeader("Server", serverInfo)

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if(err.code === 404) {
      res.status(404).end('404 | Page Not Found!')
    } else {
      res.status(500).end('500 | Server Internal Error!')
      Log.error(`渲染错误： ${req.url}`)
      Log.error(err.stack)
    }
  }

  const cacheable = isCacheable(req)
  if (cacheable) {
    const hit = microCache.get(req.url)
    if (hit) {
      if (!isProd) {
        Log.log(`命中缓存!`)
      }
      return res.end(hit)
    }
  }

  const context = {
    title: 'vue-ssr-template',
    url: req.url
  }
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.end(html)
    if (cacheable) {
      microCache.set(req.url, html)
    }
    if (!isProd) {
      Log.log(`整个请求用时: ${Date.now() - s}ms`)
    }
  })
}

var options = {
  target: 'http://192.168.1.245:8055/credit',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
};
var exampleProxy = proxy(options);
app.use('/api', exampleProxy);
app.get('*', isProd ? render : (req, res) => {
  readyPromise.then(() => render(req, res))
})
const port = process.env.PORT || 8080
app.listen(port, () => {
  Log.log(`服务启动成功： localhost:${port}`)
})
