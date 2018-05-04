import axios, { AxiosResponse } from 'axios'
import message from 'antd/lib/message'
import pagesRouter from './pagesRouter'
import history from './history'

const adminAxios = axios.create({baseURL: '/admin'})
const pmsAxios = axios.create({baseURL: '/pms'})

// axios.defaults.baseURL = '/pms'
pmsAxios.interceptors.response.use((res: AxiosResponse) => {
  const { data } = res
  // 返回七牛云图片 data.url
  if (data.code === 0 || data.code === 40002 || data.url) { return res }
  if (data.code === 40001) {
    // console.warn('token 非法\n跳转到登录')
    // 准备跳转到登录
    localStorage.removeItem('username')
    localStorage.removeItem('SMS_ADMIN_TOKEN')
    // 这里要加个 basename
    history.push(pagesRouter.Login)
    // setTimeout(() => {}, 500)
    if (data.message) {
      message.error(data.message)
    }
    return Promise.reject({ msg: 'token非法' })
  }
  // console.error(data)
  if (data.msg) { message.error(data.msg) }
  return Promise.reject({
    code: data.code,
    msg: data.msg
  })
})

adminAxios.interceptors.response.use((res: AxiosResponse) => {
  const { data } = res
  // 返回七牛云图片 data.url
  if (data.code === 0 || data.code === 40002 || data.url) { return res }
  // console.error(data)
  if (data.message) { message.error(data.message) }
  return Promise.reject({
    code: data.code,
    msg: data.message
  })
})

export { pmsAxios, adminAxios }
