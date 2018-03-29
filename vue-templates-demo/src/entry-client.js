import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'
import ProgressBar from './components/ProgressBar.vue'

// 全局的进度条
const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount()
document.body.appendChild(bar.$el)

// 当路由的参数发生改变时，全局的mixin调用asyncData
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

// 启动服务器初始化状态的存储。
// 状态是在SSR中确定的，并在页面标记中内联。
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// 添加路由钩子，解决异步
router.onReady(() => {
  // 添加路由器钩子用于处理异步。
  // 在初始路由之后执行它，这样我们就不会重复获取已有的数据了。
  // 使用router.beforeresolve()使所有的异步组件都得到解决。
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    bar.start()
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        bar.finish()
        next()
      })
      .catch(next)
  })

  // 插入dom
  app.$mount('#app')
})

// 如果是https请求，serverWorker注册模块
if ('https:' === location.protocol && navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js')
}
