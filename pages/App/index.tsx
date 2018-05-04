import * as React from 'react'
import { Route, Redirect, Switch, Router } from 'react-router-dom'
import { Layout } from 'antd'

import Header from '@Components/Header'
import SideBar from '@Components/SideBar'
import routes from '@Src/routes'
import { pagesRouter, auth as authorize, history } from '@Utilities'

import { RouteItem, Routes } from './d'
import './index.less'

const { Content, Sider } = Layout
const loginRoute = routes.filter(item => item.path === pagesRouter.Login)[0]
/**
 * 筛选出除 login页面所有的路由表
 * 对有 children属性的进行扁平化操作
 */
const authRoutes: object[] = []
routes.filter(item => item.path !== pagesRouter.Login)
      .map(({ path, openKeys, children, component = '' }: Routes): void => {
        if (children && children.length) {
          // 扁平化
          children.map((subRoute: RouteItem): void => {
            authRoutes.push({
              path: subRoute.path,
              component: subRoute.component,
              openKeys,
            })
          })
        } else {
          authRoutes.push({
            path,
            openKeys,
            component: component,
          })
        }
      })
/* tslint:disable */
class App extends React.Component {
  Wrap = (BundleComponent: any) => (
    <Layout className="app">
      <Layout>
        <Sider>
          <SideBar />
        </Sider>
        <Content>
          <Header />
          <div className="main-content">
            {BundleComponent}
          </div>
          {/*
            <Footer>PO System ©2018 Created by Jiuhuar</Footer>
          */}
        </Content>
      </Layout>
    </Layout>
  )

  render() {
    // const auth: boolean = authorize.getToken() !== ''

    return (
      <Router history={history}>
        <Switch>

          {/**
            * 登录页面路由匹配
            */}
          <Route
            exact={true}
            path={loginRoute.path}
            render={() => {
              if (authorize.getToken()) {
                return <Redirect to={'/'} />
              }
              return <loginRoute.component />
            }}
          />

          {/**
            * 根据路由表匹配所有路由
            */}
          {authRoutes.map((route: RouteItem, index: number) =>
            <Route
              key={index}
              path={route.path}
              exact={true}
              render={({ history }) => {
                if (authorize.getToken()) {
                  // 需要在组件中控制路由跳转，把history对象传入组件中
                  return this.Wrap(<route.component history={history} />)
                }
                return <Redirect key={index} to={pagesRouter.Login} />
              }}
            />
          )}

          {/**
            * 404 not found的类似处理
            * 如果路由不批匹配路由表内所有的路由
            * 则判断是否验证登录
            * 若是跳转到首页
            * 否则跳转到登录页面
            */}
          <Route
            path="/*"
            render={() => {
              if (authorize.getToken()) {
                return <Redirect to={pagesRouter.GoodsList} />
              }
              return <Redirect to={pagesRouter.Login} />
            }}
          />
        </Switch>
      </Router>
    )
  }
}

export default App
