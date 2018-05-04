const CONFIG = {
  name: 'dev',
  clientPrefix: '',
  server: {
    host: 'http://120.55.160.22:9080',
    port: 9999,
    https: false,
    prefix: '/pms-static',
  },
  qiniu: {
    http: 'http://upload.qiniu.com/',
    https: 'https://upload.qbox.me/',
    file1: 'http://file1.jiuhuar.cn/', // 一般都是这个文件
    s1: 'http://file1.jiuhuar.cn/'
  },
}

export default CONFIG
