/**
 * update token
 */
// const tokenName = 'SMS_ADMIN_TOKEN'
// class Auth {
//   static status () {
//     return !!localStorage.getItem(tokenName)
//   }
//
//   static checkIn (token: string) {
//     if (token) {
//       localStorage.setItem(tokenName, token)
//       axios.defaults.headers.common['x-auth-token'] = token
//     }
//   }
//
//   static updateToken (token: string) {
//     localStorage.setItem(tokenName, token)
//     axios.defaults.headers.common['x-auth-token'] = token
//   }
//
//   static logOut () {
//     localStorage.removeItem(tokenName)
//   }
//
//   static getToken () {
//     return localStorage.getItem(tokenName) || ''
//   }
// }
//
// export default Auth
