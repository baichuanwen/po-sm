/**
 * Created by nicolaszs on 2017/01/02.
 */
import { pmsAxios as axios, adminAxios } from './request'
import language from './localeLang'

export { default as pagesRouter } from './pagesRouter'
export { default as REGEXP } from './REGEXP'
export { default as config } from './devConfig'
export { default as navs } from './navs'
export { default as history } from './history'
export { default as asyncComponent } from './asyncComponent'
export { default as initTableScroll } from './initTableScroll'
export { default as mainContentScroll } from './mainContentScroll'
export { default as getPicSrc } from './getPicSrc'

function updateAxiosToken (token: string) {
  axios.defaults.headers.common['x-auth-token'] = token
  // axios.defaults.headers.common['token'] = token
}
/**
 * update token
 */
const tokenName = 'SMS_ADMIN_TOKEN'
class Auth {
  static status () {
    return !!localStorage.getItem(tokenName)
  }

  static checkIn (token: string) {
    if (token) {
      localStorage.setItem(tokenName, token)
      updateAxiosToken(token)
    }
  }

  static updateToken (token: string) {
    localStorage.setItem(tokenName, token)
    updateAxiosToken(token)
  }

  static logOut () {
    return localStorage.removeItem(tokenName)
  }

  static getToken () {
    return localStorage.getItem(tokenName) || ''
  }
}
/**
 * update axios token
 */
updateAxiosToken(Auth.getToken())

export { Auth as auth }
export { language as langChange }
export { axios, adminAxios }
/**
 * form hasErrors validate
 */
export function hasErrors (fieldsError: object) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}
