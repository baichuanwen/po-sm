import * as React from 'react'
import * as ReactDOM from 'react-dom'
// import { Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import * as zh from 'react-intl/locale-data/zh'

import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import enUS from 'antd/lib/locale-provider/en_US'
// import 'moment/locale/zh-cn'

import App from '@Src/pages/App'
import registerServiceWorker from './registerServiceWorker'
// 引入 redux store
import store from '@Redux/store'
import { langChange } from '@Utilities'
// 引入locale配置文件，具体路径根据实际情况填写
import formatZh from './locals/zh'
import formatEn from './locals/en'

import './index.less'

// 需要本地化的语言
addLocaleData([...en, ...zh])
const localeData = {
  zh: formatZh,
  en: formatEn
}
const category = langChange.getLang()

ReactDOM.render(
  <IntlProvider locale={category} messages={localeData[category]}>
    <LocaleProvider locale={category === 'zh' ? zhCN : enUS}>
      <Provider store={store} >
        <App />
      </Provider>
    </LocaleProvider>
  </IntlProvider>,
  document.getElementById('root') as HTMLElement
)
registerServiceWorker()

// 只有当开启了模块热替换时 module.hot 才存在
if (module.hot) {
  // accept 函数的第一个参数指出当前文件接受哪些子模块的替换，这里表示只接受 ./AppComponent 这个子模块
  // 第2个参数用于在新的子模块加载完毕后需要执行的逻辑
  module.hot.accept(['@Src/pages/App'], () => {
    // 新的 AppComponent 加载成功后重新执行下组建渲染逻辑
    ReactDOM.render(<App />, window.document.getElementById('app'));
  });
}
