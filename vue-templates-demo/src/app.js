import Vue from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import titleMixin from './util/title'
import * as filters from './util/filters'
import ElementUi from 'element-ui'

Vue.use(ElementUi)
// mixin 处理标题
Vue.mixin(titleMixin)

// 注册全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 暴露一个factory函数，它在每个调用上创建一个新的store、router和应用实例(每个SSR请求都被调用)。
export function createApp () {
  // 创建store和router
  const store = createStore()
  const router = createRouter()

  // 同步router和vuex,注册 `store.state.route`
  sync(store, router)
  // 创建应用实例.
  // 在这里，我们将路由器、存储和ssr上下文注入到所有子组件中，
  // 在其他组件里可以使用，`this.$router` and `this.$store`.
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  // 暴露 app, router, store.
  // 注意  这里并没有使用应用实例 app,
  // 服务器渲染和客户端渲染，引用时，变量指向内容不同
  return { app, router, store }
}
