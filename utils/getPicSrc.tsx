import config from './devConfig'

/* tslint:disable */
function getPicSrc (src: string, params: any = {}) {
  let { origin, thumbnail } = params
  thumbnail = thumbnail ? thumbnail : '100x'
  src = src.split('|')[0]
  let param = `?imageMogr2/auto-orient/thumbnail/${thumbnail}`
  if (origin) {
    param = ''
  }
  return `${config.qiniu.file1}${src}${param}`
}

export default getPicSrc
