import * as React from 'react'
import { Form, Icon, AutoComplete, Input, Button, message, Checkbox } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'

import { hasErrors, axios, auth, pagesRouter, history, REGEXP } from '@Utilities'
import './index.less'

const messages = defineMessages({
  loginTitle: {
    id: 'Login.Title',
    defaultMessage: '账号登录'
  },
  company: {
    id: 'Login.company',
    defaultMessage: '酒花儿'
  },
  systemName: {
    id: 'Login.systemName',
    defaultMessage: '采购管理系统'
  },
  login: {
    id: 'Login.login',
    defaultMessage: '登录',
  },
  emptyUsername: {
    id: 'Login.emptyUsername',
    defaultMessage: '用户名不能为空'
  },
  usernamePlaceholder: {
    id: 'Login.usernamePlaceholder',
    defaultMessage: '请输入用户名'
  },
  emptyPassword: {
    id: 'Login.emptyPassword',
    defaultMessage: '密码不能为空'
  },
  usernameWarningMes: {
    id: 'Login.usernameWarningMes',
    defaultMessage: '用户名需为正确的邮箱格式'
  },
  passwordWarningMes: {
    id: 'Login.passwordWarningMes',
    defaultMessage: '请输入 8位有效密码'
  },
  passwordPlaceholder: {
    id: 'Login.passwordPlaceholder',
    defaultMessage: '请输入密码'
  },
  formWarningMes: {
    id: 'Login.formWarningMes',
    defaultMessage: '表单填写有误，请仔细检查表单'
  },
  loginSuccess: {
    id: 'Login.loginSuccess',
    defaultMessage: '登录成功'
  },
  autoLogin: {
    id: 'Login.autoLogin',
    defaultMessage: '三天内自动登录'
  }
})
const FormItem = Form.Item

interface BasicStatic {
  loading: boolean
  dataSource: string[]
  autoLogin: boolean
}

class LoginForm extends React.Component<{} & FormComponentProps & InjectedIntlProps> {
  state: BasicStatic = {
    loading: false,
    dataSource: [],
    autoLogin: true,
  }

  /**
   * 判断当前的输入值有没有包含 @
   * 若有，不进行邮箱后缀补全操作
   * 若没有，补全邮箱格式
   */
  handleSearch = (value: string): void => {
    let result: string[]
    if (!value || value.indexOf('@') >= 0) {
      result = []
    } else {
      result = ['jiuhuar.com', 'gmail.com', '163.com', 'qq.com'].map(
        domain => `${value}@${domain}`
      )
    }
    this.setState({ dataSource: result })
  }

  /**
   * 登录
   */
  login = (parmas: object) => {
    const {
      intl: { formatMessage },
    } = this.props

    // disabled button
    this.setState({ loading: true })
    axios.post('account/login', parmas).then(res => {
      const { token, pwdChanged } = res.data.data
      auth.updateToken(token)

      localStorage.setItem('userInfo', JSON.stringify(res.data.data))
      message.success(formatMessage(messages.loginSuccess))

      if (!pwdChanged) {
        return history.push(pagesRouter.ChangePassword)
      }

      return history.push(pagesRouter.GoodsList)
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

    // return console.log(getFieldsValue())
    return this.login(getFieldsValue())
  }

  /**
   * 是否是 3天内自动登录
   */
  autoLogin = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { checked } = e.target as HTMLInputElement
    this.setState({ autoLogin: checked })
  }

  render() {
    const {
      form: { getFieldDecorator },
      intl: { formatMessage },
    } = this.props

    const { dataSource } = this.state

    return (
      <div className="loginpagebc">
        <header className="login-header">
          <img className="logo" src="" alt=""/>
          <span className="company">
            {formatMessage(messages.company)}
          </span>
          <span className="systemName">
            {formatMessage(messages.systemName)}
          </span>
        </header>

        <section
          className="login-main"
          draggable={true}
          onDragStart={(e) => { console.log((e.target as HTMLElement).offsetTop) }}
          onDragEnd={(e) => { console.log((e.target as HTMLElement).getBoundingClientRect()) }}
        >
          <div className="loginpage">
            <div className="login-title">
              <h2><FormattedMessage {...messages.loginTitle}/></h2>
            </div>

            <div className="loginbox">
              <Form onSubmit={this.handleSubmit}>

                <Icon className="username-icon" type="mail" />
                <FormItem
                  labelCol={{span: 24}}
                  wrapperCol={{span: 24}}
                  // label={<FormattedMessage id={'username'}/>}
                  className="username"
                >
                  {getFieldDecorator('username', {
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage(messages.emptyUsername),
                      },
                      {
                        type: 'email',
                        message: formatMessage(messages.usernameWarningMes),
                      },
                    ],
                  })(
                    <AutoComplete
                      onSearch={this.handleSearch}
                      placeholder={
                        formatMessage(messages.usernamePlaceholder)
                      }
                      dataSource={dataSource}
                      // autoComplete="username"
                    />
                  )}
                </FormItem>

                <Icon className="password-icon" type="lock" />
                <FormItem
                  labelCol={{span: 24}}
                  wrapperCol={{span: 24}}
                  // label={<FormattedMessage id={'password'}/>}
                  className="password"
                >
                  {getFieldDecorator('password', {
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
                      // addonBefore={<Icon type="lock" />}
                      type="password"
                      placeholder={
                        formatMessage(messages.passwordPlaceholder)
                      }
                      size="large"
                      autoComplete="current-password"
                    />
                  )}
                </FormItem>

                <FormItem wrapperCol={{span: 24}} className="auto-login">
                  {getFieldDecorator('autoLogin', {
                    initialValue: this.state.autoLogin,
                    validateTrigger: 'onBlur',
                    rules: [],
                  })(
                    <Checkbox onChange={this.autoLogin} defaultChecked={this.state.autoLogin}>
                    {formatMessage(messages.autoLogin)}
                    </Checkbox>
                  )}
                </FormItem>

                <FormItem className="button">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={this.state.loading}
                    disabled={this.state.loading}
                    size="large"
                  >
                    <FormattedMessage {...messages.login} />
                  </Button>
                </FormItem>
              </Form>
            </div>
          </div>
        </section>

        <footer className="login-footer">Copyright © 2018 沪ICP备 16000729号-1</footer>
      </div>
    )
  }
}

// antd form create
const Login = Form.create<{}>()(LoginForm)
// react-intl inject
export default injectIntl(Login)
