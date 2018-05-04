import { langChange, auth, getPicSrc } from '@Utilities'
/**
 * work with token auth
 */
test('auth', () => {
  // expect.assertions(1)
  const token = 'abc'

  // get token default
  expect(auth.getToken()).toBe('')

  // update token
  auth.updateToken(token)
  expect(auth.getToken()).toBe(token)

  // check in token
  auth.checkIn(token)
  expect(auth.getToken()).toBe(token)
  // logout
  auth.logOut()
  expect(auth.getToken()).toBe('')
})

/**
 * test with locale language
 */
test('langChange', () => {
  expect(langChange.status()).not.toBeTruthy()

  // updateLang
  const enUS = 'en'
  const zhCN = 'zh'
  langChange.updateLang(enUS)
  expect(langChange.getLang()).toBe(zhCN)

  langChange.updateLang(zhCN)
  expect(langChange.getLang()).toBe(enUS)
})

/**
 * test with getPicSrc
 */
test('getPicSrc', () => {
  const src = 'FvDDMgs9Nc3-heLtgCcewWqd8kRK|1440|953'
  console.log(getPicSrc(src))
  expect(getPicSrc(src)).toMatch(/http/)
})
