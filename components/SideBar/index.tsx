import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'

import { config, navs, history } from '@Utilities'
import './index.less'

const logo = require('./logo.svg')

interface SubNav {
  readonly sn: string
  readonly name: string
  readonly subNav?: object[]
  readonly hideParent?: object
  readonly pageUrl?: string
}

const { SubMenu } = Menu

class SideBar extends React.Component {
  state = {
    navs: [],
    menus: {},
    selectedKeys: '',
    defaultOpenKeys: [''],
  }

  render() {
    const { pathname }: { pathname: string } = history.location

    let prefix = config.clientPrefix
    if (process.env.NODE_ENV === 'production') {
      prefix = config.server.prefix
    }

    const path: string = pathname.slice(prefix.length)
    const selectedKeys: string[] = [path.split('/')[2]]
    const defaultOpenKeys: string[] = [path.split('/')[1]]

    return (
      <div className="sidebar">
        <div className="logo-header">
          <img src={logo} className="logo" alt="logo" />
          <div className="name">
            <div>BEER GEEK</div>
            <div>PO System</div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
        >
        {navs && navs.map(({ sn, name, hideParent, subNav = [] }: SubNav) => {
          return (
            <SubMenu
              className={hideParent && 'no-parent'}
              key={sn}
              title={<span>{name}</span>}
            >
              {subNav.map(({sn: subSn, name: subName, pageUrl: subPageUrl }: SubNav) =>
                <Menu.Item key={subSn}>
                  <Link to={subPageUrl ? subPageUrl : ''}>{subName}</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )
        })}
        </Menu>
      </div>
    )
  }
}

export default SideBar
