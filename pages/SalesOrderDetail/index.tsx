import * as React from 'react'

import OrderDetailBasic from '@Components/OrderDetailBasic'
import { history, mainContentScroll } from '@Utilities'
import './index.less'

// const AppOrderDetail = () =>
//   <div className="app-order-detail">
//     {orderType === 'admin' &&
//       <h3 className="title">手工订单详情</h3>
//     }
//     {orderType === 'user' &&
//       <h3 className="title">APP订单详情</h3>
//     }
//
//     {orderId && <OrderDetailBasic {...basicConfig} />}
//   </div>
//
// export default AppOrderDetail
export default class AppOrderDetail extends React.Component {
  componentDidMount () {
    mainContentScroll()
  }

  render () {
    const { location: { search, pathname } } = history
    const orderId = search.split('=')[1]
    const orderType = pathname.includes('manualorder') ? 'admin' : 'user'

    const basicConfig = {
      orderType: orderType,
      orderId: orderId,
      needOrderRemark: true,
    }

    return (
      <div className="app-order-detail">
        {orderType === 'admin' &&
          <h3 className="title">手工订单详情</h3>
        }
        {orderType === 'user' &&
          <h3 className="title">APP订单详情</h3>
        }

        {orderId && <OrderDetailBasic {...basicConfig} />}
      </div>
    )
  }
}
