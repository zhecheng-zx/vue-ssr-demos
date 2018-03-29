import axios from 'axios'
import {getCookie} from '../util/cookie'
const isProd = process.env.NODE_ENV === 'production'

let transformRequest = function (data) {
  let ret = ''
  for (let it in data) {
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  return ret.substring(0,ret.length-1)
}
export function createAPI() {
  let api
  let cook =process.__COOKIE__ || ''
  axios.defaults.withCredentials = true
  axios.defaults.timeout = 60000
  axios.interceptors.response.use((res) => {
    if(res.status >= 200 && res.status <300){
      return res
    }
    return Promise.reject(res)
  }, (error) => {
    return Promise.reject({message: '登录超时，请重新登录！', err: error, type: 1})
  })
  if (process.__API__) {
    api = process.__API__
  } else {
    api = process.__API__ = {
      get(target, options = {}){
        let token = ''
        if(target == "/api/authenticate/login"){
          token = ''
        }else{
          token = getCookie('AUTHENTICATE_TOKEN')
        }
        return new Promise((target, reject) => {
          axios.request({
            url: target+';JSESSIONID='+token,
            method: 'get',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              'Authorization': token
            },
            params: options
          }).then(res => {
            resolve(res.data);
          }).catch((error) => {
            reject(error)
          })
        })
      },
      post(target, options = {}){
        let token = ''
        if(target == "/api/authenticate/login"){
          token = ''
        }else{
          token = getCookie('AUTHENTICATE_TOKEN')
        }
        return new Promise((resolve, reject) => {
          axios.request({
            url: target,
            method: 'post',
            headers: {
              'Cookie': cook,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              'Authorization': token
            },
            params: transformRequest(options)
          }).then(res => {
            resolve(res.data)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      post2: function (target, options={}) {
        let token = ''
        if(target == "/api/authenticate/login"){
          token = ''
        }else{
          token = getCookie('AUTHENTICATE_TOKEN')
        }
        return new Promise((resolve, reject) =>{
          axios.post(target, transformRequest(options),{headers:{'Content-Type': 'multipart/form-data','Authorization': token}}).then(res => {
            resolve(res.data)
          }).catch((error) => {
            reject(error)
          })
        })
      }
    }
    api.onServer = true
  }
  return api
}
// import Firebase from 'firebase'
// import LRU from 'lru-cache'
//
// export function createAPI ({ config, version }) {
//   let api
//   // this piece of code may run multiple times in development mode,
//   // so we attach the instantiated API to `process` to avoid duplications
//   if (process.__API__) {
//     api = process.__API__
//   } else {
//     Firebase.initializeApp(config)
//     api = process.__API__ = Firebase.database().ref(version)
//
//     api.onServer = true
//
//     // fetched item cache
//     api.cachedItems = LRU({
//       max: 1000,
//       maxAge: 1000 * 60 * 15 // 15 min cache
//     })
//
//     // cache the latest story ids
//     api.cachedIds = {}
//     ;['top', 'new', 'show', 'ask', 'job'].forEach(type => {
//       api.child(`${type}stories`).on('value', snapshot => {
//         api.cachedIds[type] = snapshot.val()
//       })
//     })
//   }
//   return api
// }
