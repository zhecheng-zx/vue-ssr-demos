import { createApp } from './app'

const isDev = process.env.NODE_ENV !== 'production'

//这个导出的函数将由bundleren渲染器调用。
// 这是我们在实际呈现应用程序之前执行数据预取来确定应用程序状态的地方。
// 由于数据获取是异步的，因此这个函数将返回一个解析结果到应用程序实例。
export default context => {
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const { app, router, store } = createApp()

    const { url } = context
    const fullPath = router.resolve(url).route.fullPath

    if (fullPath !== url) {
      reject({ url: fullPath })
    }

    // 设置路由地址
    router.push(url)

    // 路由中异步请求加载完成后
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 如果没有匹配到模块，返回404
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }
      // 调用匹配到的的组件的fetchData钩子。
      // 预取钩子分派一个存储操作，并返回一个Promise，
      // 当操作完成时，该操作将被解析，存储状态已被更新。
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
        store,
        route: router.currentRoute
      }))).then(() => {
        isDev && console.log(`数据预加载用时: ${Date.now() - s}ms`)
        // 在所有预取钩子都被解析之后，我们的存储现在已经填充了呈现应用程序所需的状态。
        // 在呈现上下文中显示状态，并让请求处理程序在HTML响应中内联状态。
        // 这允许客户端存储在不需要复制客户机上的初始数据的情况下就可以启动服务器端状态。
        context.state = store.state
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
