import { axios, auth } from '@Utilities'

const parmas = {
  username: 'test@jiuhuar.com',
  password: '11111111',
  autoLogin: true,
}

/**
 * account log in
 */
it('login and update localStorage token', () => {
  /**
   * 如果不存在 token
   */
  const token = auth.getToken()
  if (!token) {
    // expect.assertions(4)

    /**
     * login success
     */
    return axios.post('account/login', parmas).then(res => {
      const { data } = res.data
      // const { pwdChanged, token, id, username } = res.data.data

      // localStorage.setItem('SMS_ADMIN_TOKEN', token)
      // console.log(localStorage.getItem('SMS_ADMIN_TOKEN'))
      // console.log(res.data.data)
      expect.assertions(4)

      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('username')
      expect(data).toHaveProperty('pwdChanged')
      expect(data).toHaveProperty('token')
      // expect(username).toBe(parmas.username)
      // expect(pwdChanged).toBeFalsy()
      // expect(token.length).toBeGreaterThan(0)

    /**
     * login failure
     */
    }).catch(res => {
      expect.assertions(1)

      expect(res).toHaveProperty('msg')
    })
  }

  expect.assertions(1)
  return expect(token.length).toBeGreaterThan(0)
})
