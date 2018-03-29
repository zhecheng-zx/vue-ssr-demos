import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

import index from '../views/index.vue'

export function createRouter () {
  let routes = {
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      { path: '/index', component: index, meta: {requireAuth: true }},
      { path: '/', redirect: '/index'}
    ]
  }
  const router = new Router(routes)
  return router
}
