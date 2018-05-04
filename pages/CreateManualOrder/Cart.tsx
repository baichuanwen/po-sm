/**
 * Created by zhiyang on 2017/12/12.
 */
import * as React from 'react'
import { getPicSrc } from '@Utilities'
import { Table, InputNumber, Button, Icon } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'

import ProductPicker from './ProductPicker'
import { ProductsProps } from './index.d'

interface CartProps {
  onChange?: (value: ProductsProps[]) => void
}

/**
 * solve the input number onBlur warning problem
 */
interface NewInputNumberProps extends InputNumberProps {
  onBlur?: (value: number | string | undefined) => void
}

class NewInputNumber extends React.Component<NewInputNumberProps> {
  props: NewInputNumberProps
  render() {
    return <InputNumber {...this.props} />
  }
}
// 手动创建订单时需要提供商品以及其数量，相当于购物车这个概念
class Cart extends React.Component<CartProps> {
  state = {
    visible: false,
    productList: [],
    orderBuyParams: []
  }
  handlePickerShow = () => {
    this.setState({visible: true})
  }
  handlePickerHide = () => {
    this.setState({visible: false})
  }
  handleSelectProduct = (action: string, product: ProductsProps) => {
    let productList = []
    if (action === 'add') {
      productList = [...this.state.productList, product]
    } else {
      productList = this.state.productList.filter(({id}: {id: number}) => id !== product.id)
    }
    this.setState({productList})
  }
  // 该回调函数绑定的是 onBlur 事件
  handleInputChange = (type: string, productId: number, e: React.SyntheticEvent<HTMLElement>) => {
    const value = (e.target as HTMLInputElement).value
    console.log(type, value)
    let orderBuyParams = []
    const include = this.state.orderBuyParams.find(({skuId}: {skuId: number}) => productId === skuId)
    if (include) {
      orderBuyParams = this.state.orderBuyParams.map((item: ProductsProps) => {
        if (item.skuId !== productId) {
          return item
        }
        console.log(item)
        return {
          ...item,
          [type]: value
        }
      })
    } else {
      orderBuyParams = [...this.state.orderBuyParams, {
        skuId: productId,
        [type]: value
      }]
    }
    this.setState({orderBuyParams}, this.triggerChange)
  }
  handleDelete = (productId: number) => {
    console.log('delete', productId)
    const productList = this.state.productList.filter(({id}: {id: number}) => productId !== id)
    const orderBuyParams = this.state.orderBuyParams.filter(({skuId}: {skuId: number}) => skuId !== productId)
    this.setState({
      productList,
      orderBuyParams
    }, this.triggerChange)
  }
  triggerChange = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange(this.state.orderBuyParams)
    }
  }
  render () {
    const { visible, productList } = this.state
    const columns = [
      {
        title: '商品图片',
        key: 'img',
        render: (text: string, record: ProductsProps, index: number) => <img src={getPicSrc(record.mainPic)} alt="商品图片" style={{width: '50px'}}/>,
        width: 80
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        width: 150
      },
      {
        title: 'sku名称',
        dataIndex: 'skuName'
      },
      {
        title: '商品类别',
        dataIndex: 'structName'
      },
      {
        title: '商品条形码',
        dataIndex: 'barCode'
      },
      {
        title: '商城售价(元)',
        dataIndex: 'price',
        width: 150
      },
      {
        title: '实际售价',
        key: 'realPrice',
        render: (text: string, record: ProductsProps, index: number) => (
          <NewInputNumber
            min={0.01}
            onBlur={this.handleInputChange.bind(this, 'price', record.id)}
          />
        )
      },
      {
        title: '数量',
        key: 'quantity',
        render: (text: string, record: ProductsProps, index: number) => (
          <NewInputNumber
            min={1}
            parser={(value: string) => Number(value.replace(/\..*/g, ''))}
            onBlur={this.handleInputChange.bind(this, 'quantity', record.id)}
          />
        )
      },
      {
        title: '操作',
        key: 'operator',
        render: (text: string, record: ProductsProps, index: number) =>
          <Button type="danger" onClick={this.handleDelete.bind(this, record.id)}>删除</Button>
      }
    ]
    return (
      <div>
        <Button type="dashed" onClick={this.handlePickerShow}>
          添加商品 <Icon type="plus"/>
        </Button>
        <ProductPicker
          visible={visible}
          checkedProducts={productList}
          handleModalCancel={this.handlePickerHide}
          onSelect={this.handleSelectProduct}
        />
        <Table columns={columns} dataSource={productList} rowKey="id" pagination={false}/>
      </div>
    )
  }
}

export default Cart
