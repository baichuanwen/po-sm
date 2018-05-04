import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import * as zh from 'react-intl/locale-data/zh'

import App from '@Pages/App'
import store from '@Redux/store'

import { langChange } from '@Utilities'

// 引入locale配置文件，具体路径根据实际情况填写
import formatZh from '@Src/locals/zh'
import formatEn from '@Src/locals/en'

// 需要本地化的语言
addLocaleData([...en, ...zh])
const localeData = {
  zh: formatZh,
  en: formatEn
}
const category = langChange.getLang()

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <IntlProvider locale={category} messages={localeData[category]}>
      <Provider store={store} >
        <App />
      </Provider>
    </IntlProvider>, div
  )
})
