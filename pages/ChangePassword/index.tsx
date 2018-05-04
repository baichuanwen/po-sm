import * as React from 'react'
import { Form, Input, Button, Col, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'

import './index.less'
import { hasErrors, axios, pagesRouter, auth, REGEXP, history } from '@Utilities'

const messages = defineMessages({
  changePwd: {
    id: 'ChangePwd.changePwd',
    defaultMessage: '密码修改'
  },
  changePwdSuccess: {
    id: 'ChangePwd.changePwdSuccess',
    defaultMessage: '密码修改成功'
  },
  formWarningMes: {
    id: 'ChangePwd.formWarningMes',
    defaultMessage: '表单填写有误，请仔细检查表单'
  },
  newPwdSameAsOldPwd: {
    id: 'ChangePwd.newPwdSameAsOldPwd',
    defaultMessage: '新密码不能和旧密码一样'
  },
  confirmPwdNotSameAsnewPwd: {
    id: 'ChangePwd.confirmPwdNotSameAsnewPwd',
    defaultMessage: '新密码两次填写不一致'
  },
  changePasswordTips: {
    id: 'ChangePwd.changePasswordTips',
    defaultMessage: '首次登录需重置初始密码'
  },
  oldPwd: {
    id: 'ChangePwd.oldPwd',
    defaultMessage: '旧密码',
  },
  newPwd: {
    id: 'ChangePwd.newPwd',
    defaultMessage: '旧密码',
  },
  confirmPwd: {
    id: 'ChangePwd.confirmPwd',
    defaultMessage: '旧密码',
  },
  emptyPassword: {
    id: 'ChangePwd.emptyPassword',
    defaultMessage: '密码不能为空'
  },
  oldPwdPlaceholder: {
    id: 'ChangePwd.oldPwdPlaceholder',
    defaultMessage: '请输入原密码'
  },
  newPwdPlaceholder: {
    id: 'ChangePwd.newPwdPlaceholder',
    defaultMessage: '请输入新密码'
  },
  confirmPwdPlaceholder: {
    id: 'ChangePwd.confirmPwdPlaceholder',
    defaultMessage: '请再次输入新密码'
  },
  passwordWarningMes: {
    id: 'ChangePwd.passwordWarningMes',
    defaultMessage: '请输入 8位有效密码'
  },
  save: {
    id: 'ChangePwd.save',
    defaultMessage: '保存',
  }
})
const FormItem = Form.Item

interface PasswordType {
  oldPwd?: string
  newPwd?: string
  confirmPwd?: string
}

interface UserInfo {
  username?: string
  id?: number
  token?: string
  pwdChanged?: boolean
}

interface BasicStatic {
  loading: boolean
  id: number
  userInfo: string
}

class ChangePasswordForm extends React.Component<FormComponentProps & InjectedIntlProps> {
  state: BasicStatic = {
    loading: false,
    id: -1,
    userInfo: '{}',
  }

  componentDidMount () {
    const newUserInfo = localStorage.getItem('userInfo')
    this.setState({ userInfo: newUserInfo })
  }

  /**
   * 修改密码
   */
  changePassword = (parmas: PasswordType) => {
    const {
      intl: { formatMessage },
    } = this.props
    const userInfoJSON: UserInfo = JSON.parse(this.state.userInfo)
    this.setState({ loading: true })
    axios.put(`/account/${userInfoJSON.id}/editPwd`, parmas).then(res => {
      message.success(formatMessage(messages.changePwdSuccess))
      auth.logOut() // remove token
      history.push(pagesRouter.Login)
    }).catch(() => {this.setState({ loading: false })})
  }

  /**
   * 点击提交按钮，登录
   * 对页面进行校验
   * hasErrors(getFieldsError()) 若校验失败，弹出 message，输入框提醒
   * 校验成功，调用 login方法，传入 params = getFieldsValue()
   */
  handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const {
      form: {
        getFieldsValue,
        getFieldsError,
        validateFieldsAndScroll,
      },
      intl: { formatMessage },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error(
        formatMessage(messages.formWarningMes)
      )
    }

    const formData: PasswordType = getFieldsValue()

    // 新密码不能和旧密码一样
    if (formData && formData.newPwd === formData.oldPwd) {
      return message.error(formatMessage(messages.newPwdSameAsOldPwd))
    }

    // 新密码两次填写不一致
    if (formData && formData.newPwd !== formData.confirmPwd) {
      return message.error(formatMessage(messages.confirmPwdNotSameAsnewPwd))
    }

    // 删除 confirm password
    delete formData.confirmPwd

    return this.changePassword(formData)
  }

  render() {
    const {
      form: { getFieldDecorator },
      intl: { formatMessage },
    } = this.props

    const formLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 12}
    }
    return (
      <div className="change-password">
        <div className="panel">
          <header>
            <h3 className="title">{formatMessage(messages.changePwd)}</h3>
            <span>{formatMessage(messages.changePasswordTips)}
            </span>
          </header>

          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formLayout}
              label={<FormattedMessage {...messages.oldPwd} />}
              className="password"
            >
              {getFieldDecorator('oldPwd', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message:  formatMessage(messages.emptyPassword)
                  },
                  {
                    pattern: REGEXP.password,
                    message: formatMessage(messages.passwordWarningMes),
                  },
                ],
              })(
                <Input
                  type="password"
                  placeholder={
                    formatMessage(messages.oldPwdPlaceholder)
                  }
                  autoComplete="current-password"
                />
              )}
            </FormItem>

            <FormItem
              {...formLayout}
              label={<FormattedMessage {...messages.newPwd} />}
              className="password"
            >
              {getFieldDecorator('newPwd', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message:  formatMessage(messages.emptyPassword)
                  },
                  {
                    pattern: REGEXP.password,
                    message: formatMessage(messages.passwordWarningMes),
                  },
                ],
              })(
                <Input
                  type="password"
                  placeholder={
                    formatMessage(messages.newPwdPlaceholder)
                  }
                  autoComplete="current-password"
                />
              )}
            </FormItem>

            <FormItem
              {...formLayout}
              label={<FormattedMessage {...messages.confirmPwd} />}
              className="password"
            >
              {getFieldDecorator('confirmPwd', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message:  formatMessage(messages.emptyPassword)
                  },
                  {
                    pattern: REGEXP.password,
                    message: formatMessage(messages.passwordWarningMes),
                  },
                ],
              })(
                <Input
                  type="password"
                  placeholder={
                    formatMessage(messages.confirmPwdPlaceholder)
                  }
                  autoComplete="current-password"
                />
              )}
            </FormItem>

            <Col offset={8}>
              <FormItem
                {...formLayout}
                className="button"
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={this.state.loading}
                  disabled={this.state.loading}
                  size="large"
                >
                  <FormattedMessage {...messages.save} />
                </Button>
              </FormItem>
            </Col>
          </Form>
        </div>
      </div>
    )
  }
}

const ChangePassword = Form.create<{}>()(ChangePasswordForm)
export default injectIntl(ChangePassword)
