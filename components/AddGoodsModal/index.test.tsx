// import { axios, auth } from '@Utilities'
import * as React from 'react'
// import * as ReactDOM from 'react-dom'
import createComponentWithIntl from '@Utilities/test.utils'
// import * as TestUtils from 'react-dom/test-utils'
// import { IntlProvider } from 'react-intl'

import AddGoodsModal from './index'

// const goodsModalConfig = {
//   // supplierId: -1,
//   warehouse: '',
//   warehouseId: 0,
//   status: 'entry',
//   className: 'add-goods-modal',
//   // intl: intl,
//   visible: true,
//   // closeGoodsModal: this.closeGoodsModal,
//   // selectedGoods: this.state.selectedGoods,
//   // updateSelectGoodsKeys: this.updateSelectGoodsKeys,
// }

// const sum = (a: number, b: number) => {
//   return a + b
// }
console.log(AddGoodsModal)

it('works with snapshot', () => {
  const compo = createComponentWithIntl(
    <div>
      {/* <AddGoodsModal /> */}
    </div>
  )

  let tree = compo.toJSON()
  // console.log(tree)
  expect(tree).toMatchSnapshot()

  // tree.props.onClick()
  tree = compo.toJSON()
  expect(tree).toMatchSnapshot()
})

// console.log(TestUtils.renderIntoDocument)
// it('works with DOM Testing', () => {
//   expect.assertions(1)
//   const compo = <IntlProvider locale='en'>
//     <Login />
//   </IntlProvider>
//   const GoodsModal = TestUtils.renderIntoDocument(compo)
//   console.log(<compo />)
//   console.log(compo.getInstance())
//   const GoodsModalNode = ReactDOM.findDOMNode(GoodsModal);
//   console.log(GoodsModalNode)
// })
