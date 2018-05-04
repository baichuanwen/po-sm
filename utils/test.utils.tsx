import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'

import store from '@Redux/store'

const createComponentWithIntl = (children: any, props = { locale: 'en' }) => {
  return renderer.create(
    <IntlProvider {...props}>
      <Provider store={store} >
        {children}
      </Provider>
    </IntlProvider>
  )
}

const createComponent = (children: any, props = { locale: 'en' }) => {
  return (
    <Provider store={store} >
      {children}
    </Provider>
  )
}

export { createComponent }
export default createComponentWithIntl
