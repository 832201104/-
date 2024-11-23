import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '@/router/index'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    get: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    delete: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    post: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    },
    put: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    }
  }
})

/**
 * 错误信息回调函数
 * @param {*} error 
 */
const messageHandler = (error, type = 'error') => {
  const { msg } = error
  ElMessage({
    message: msg || '未知错误',
    type,
  })
}

/**
 * 网络请求拦截器
 */
instance.interceptors.request.use(async config => {
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 网络返回拦截器
 */
instance.interceptors.response.use(async response => {
  const { data } = response
  return Promise.resolve(data)
}, error => {
  const { response } = error
  messageHandler(response?.data || { status: 500, success: false, msg: '未知错误' })
  return Promise.reject(error)
})

export default instance
