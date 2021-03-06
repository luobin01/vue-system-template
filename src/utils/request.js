import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: false, // send cookies when cross-domain requests
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    const code = parseInt(res.code)
    if (code !== 200) {
      Message({
        message: `${res.msg} #${code}` || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      if (code === 0) {
        MessageBox.confirm('您已退出，可以取消且停留在当前页面，或者重新登录', '确认重新登录？', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: '网络繁忙，请稍后重试 #400',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
