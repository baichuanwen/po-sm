import * as React from 'react'
import { Link } from 'react-router-dom'
import { connect, DispatchProp } from 'react-redux'
import { Breadcrumb, Dropdown, Icon, Menu, Button, message } from 'antd'
import { FormattedMessage, defineMessages } from 'react-intl'

import navs from '@Utilities/navs'
import { langChange, axios, auth, pagesRouter, history, config } from '@Utilities'
// import { getProductDropData } from '../../redux/actions/commonAction'
import './index.less'

declare type Func = () => {}

interface SubNav {
  readonly sn: string
  readonly name: string
  readonly subNav?: object[]
  readonly hideParent?: object
  readonly pageUrl?: string
}

interface UserInfo {
  username?: string
  id?: number
  token?: string
  pwdChanged?: boolean
}

interface BasicState {
  currentLang: string
  userInfo: string
}

const messages = defineMessages({
  home: {
    id: 'Header.home',
    defaultMessage: '首页',
  },
  logout: {
    id: 'Header.logout',
    defaultMessage: '退出',
  },
  changePwd: {
    id: 'Header.changePwd',
    defaultMessage: '修改密码',
  }
})

const BreadcrumbItem = Breadcrumb.Item

// const { location: { pathname } } = history

// console.log(pathname)

class Header extends React.Component<DispatchProp<Func>> {
  state: BasicState = {
    currentLang: langChange.getLang(),
    userInfo: '{}',
  }

  componentDidMount () {
    // // 提前获取所有的 product drops data
    // const { dispatch } = this.props
    // if (pathname !== '/login') {
      // tslint:disable-next-line
      // dispatch && dispatch(getProductDropData())
    // }

    const newUserInfo = localStorage.getItem('userInfo')
    this.setState({ userInfo: newUserInfo })
  }

  /**
   * 切换页面语言
   * 更改当前页面的语言
   * 重刷页面进行更新
   * ？是否还有更好的方法，不让页面重刷
   */
  switchLang = () => {
    langChange.updateLang(this.state.currentLang)
    window.location.reload()
  }

  /**
   * logout
   */
  logout = () => {
    /* tslint:disable */
    axios.put('/account/logout').then((res: any): void => {
      const { ok } = res.data
      if(ok) {
        auth.logOut()
        localStorage.removeItem('userInfo')
      	message.success('退出登录成功')
      	history.push(pagesRouter.Login)
      }
    })
  }

  /**
   * 扁平化 navs data
   */
  flatten = (arr: any) => arr.reduce((a: any, b: any) =>
    a.concat(Array.isArray(b.subNav)
      ? this.flatten(b.subNav)
      : b
    ), [])

  /**
   * 首先将数据的 一维扁平化插入数组之中
   * 再将三维数组扁平化插入数组之中
   */
  changeNavs = (arr: any) => arr.map((a: any) =>
    [a].concat(Array.isArray(a.subNav)
      ? this.flatten(a.subNav)
      : a
    ), [])[0]

  render() {
    let prefix = ''
    if (process.env.NODE_ENV === 'production') {
      prefix = config.server.prefix
    }

    const { pathname }: { pathname: string } = history.location
    const path: string[] = pathname !== '/'
      ? pathname.slice(prefix.length).split('/')
      : pagesRouter.GoodsList.slice(prefix.length).split('/')

    /**
     * 扁平化符合的 navs的数据结构
     * 重新生成符合条件的 BreadcrumbNavs
     * 权限控制时需要修改
     */
    const newNavs = navs.filter((item: SubNav) => item.sn === path[1])

    const BreadcrumbNavs: object[] = pathname !== pagesRouter.ChangePassword && this.changeNavs(newNavs)
      .filter((item: SubNav) => {
        const pos = path.findIndex((pa: string) => pa === item.sn)
        if (pos > -1) {
          return true
        }
        return false
      })
      .filter((item: SubNav, index: number) => {
        if (index === 0) {
          return true
        }
        const pos = path.findIndex((pa: string) => (item.pageUrl || '').includes(path[path.length - 2]))
        if (pos > -1) {
          return true
        }
        return false
      })

    /**
     * JSON parse userInfo
     */
    const userInfoJSON:UserInfo = JSON.parse(this.state.userInfo)

    const logout = (
      <Menu onClick={this.logout}>
        <Menu.Item><FormattedMessage {...messages.logout} /></Menu.Item>
      </Menu>
    )

    return (
      <div className="header">
        {pathname === pagesRouter.ChangePassword &&
          <Breadcrumb separator="/">
            <BreadcrumbItem>
              <Icon type="folder" /> <FormattedMessage {...messages.home} />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Icon type="file" /> <FormattedMessage {...messages.changePwd} />
            </BreadcrumbItem>
          </Breadcrumb>
        }

        {pathname !== pagesRouter.ChangePassword &&
          <Breadcrumb separator="/">
            {BreadcrumbNavs.map(({ sn, name, pageUrl = ''}: SubNav, index: number, arr: SubNav[]) => {
                if (index === 1 && arr.length > 2) {
                  return <BreadcrumbItem key={sn}>
                    <Link to={pageUrl}><Icon type="folder" /> {name}</Link>
                  </BreadcrumbItem>
                }

                return (
                  <BreadcrumbItem key={sn}>
                    <Icon type={index === 0 ? 'home' : 'file'} /> {name}
                  </BreadcrumbItem>
                )
              }
            )}
            {/* <BreadcrumbItem>App</BreadcrumbItem> */}
          </Breadcrumb>
        }

        <div className="right">
          <Button onClick={this.switchLang}>{this.state.currentLang === 'zh' ? 'English' : '中文'}</Button>
          <Dropdown overlay={logout} placement="bottomCenter">
            <div className="ant-dropdown-link">
              {userInfoJSON && userInfoJSON.username} <Icon type="down" />
            </div>
          </Dropdown>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  return state
}

export default connect(mapStateToProps)(Header)
