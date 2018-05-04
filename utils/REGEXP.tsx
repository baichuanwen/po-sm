/**
 * Created by nicolaszs on 2018/01/15.
 */

export default {
  email: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
  password: /\b[0-9a-z]{8}$/,

  name: /^.{1,50}$/,
  Integer: /^\d+$|^$/,
  IntegerAndWhite: /^\d+$|^$/,
  mobile: /^[\d|-]{4,20}$/,
  certificate: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  percentage: /^\d+(\.\d{1,2})?$/,
  mobilePhone: /^\s*\d{11}\s*$/, // 手机号

  supplierShortName: /^[A-Z]+(\d)*$/
}
