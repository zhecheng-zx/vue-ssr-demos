import axios from 'axios'
import { Notification } from 'element-ui'
import {getCookie,delCookie,setCookie} from '../util/cookie'
let transformRequest = function (data) {
  let ret = ''
  for (let it in data) {
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  return ret.substring(0,ret.length-1)
}

export function createAPI() {
  let api,flag=true
  axios.defaults.withCredentials = true
  axios.defaults.timeout = 60000
  axios.interceptors.response.use((res) => {
    if(res.status >= 200 && res.status < 300){
      if(res.headers['access-control-expose-headers']) {
        setCookie('AUTHENTICATE_TOKEN', res.headers[res.headers['access-control-expose-headers']])
      }
      return res
    }
    return Promise.reject(res)
  }, (error) => {
    // 网络异常
    if(error.request.responseURL.indexOf('token')>=0){
      return
    }
    if(flag) {
      Notification({
        title: '提示信息',
        message: "登录超时，请重新登录",
        type: 'error',
        duration: '2000'
      });
      flag = false
    }
    delCookie("AUTHENTICATE_TOKEN")
    localStorage.removeItem('userName')
    sessionStorage.removeItem('ANTIFRAUD_SQUERYONE_tradeId')
    sessionStorage.removeItem('_import_tradeId')
    sessionStorage.removeItem('cost')
    sessionStorage.removeItem('customTempId')
    sessionStorage.removeItem('dataCount')
    sessionStorage.removeItem('from_page')
    setTimeout(()=>{
      window.location.href = '/'
    },2000)
    return Promise.reject({ message: '登录超时，请重新登录', err: error })
  });
  if(process.__API__){
    api = process.__API__
  }else{
    api = process.__API__ = {
      get (target, params={}) {
        let token = ''
        if(target == "/api/authenticate/login"){
          token = ''
        }else{
          token = getCookie('AUTHENTICATE_TOKEN')
        }
        const suffix = Object.keys(params).map(name => {
          return `${name}=${params[name]}`
        }).join('&')
        let urls = ''
        if(suffix.length>0){
          urls = `${target}?${suffix}`
          urls += '&JSESSIONID='+token
        }else{
          urls = `${target}`
          urls += ';JSESSIONID='+token
        }
        return new Promise((resolve, reject) => {
          axios.get(urls, params,{headers:{'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 'Authorization': token}}).then(res =>{
            resolve(res.data);
          }).catch((error) => {
            reject(error);
          })
        })
      },
      get2 (target, params={}) {
        let urls = ''
        urls = `${target}`
        return new Promise((resolve, reject) => {
          axios.get(urls, params,{headers:{'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}}).then(res =>{
            resolve(res.data);
          }).catch((error) => {
            reject(error);
          })
        })
      },
      post: function (target, options = {}) {
        let token = getCookie('AUTHENTICATE_TOKEN')
        return new Promise((resolve, reject) =>{
          axios.post(target, transformRequest(options),{headers:{'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization': token}}).then(res => {
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
  }
  return api
}
//
// import Firebase from 'firebase/app'
// import 'firebase/database'
//
// export function createAPI ({ config, version }) {
//   Firebase.initializeApp(config)
//   return Firebase.database().ref(version)
// }
