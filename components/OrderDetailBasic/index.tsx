import * as React from 'react'
import { Card, Col, Row, Tag, Table, Button } from 'antd'
import * as moment from 'moment'

import { adminAxios, getPicSrc } from '@Utilities'
import RefundModal from './RefundModal'
import UpdateExpress from './UpdateExpress'
import OrderRemark from './OrderRemark'
import OrderPay from './OrderPay'

interface OrderDetailBasicProps {
  orderId: number | string
  orderType?: string
  needOrderRemark?: boolean
}

export default class OrderDetailBasic extends React.Component<OrderDetailBasicProps> {
  state = {
    order: {},
    refundVisible: false,
    expressVisible: false,
    orderItemId: 0,
  }

  componentDidMount () {
    this.getData()
  }

  getData = () => {
    const { orderId } = this.props

    adminAxios.get(`/order/${orderId}`).then(res => {
      this.setState({
        order: res.data.data,
        orderId: orderId,
      })
    })
  }

  computedPayType = () => {
    const { source, payType, tradeType }: any = this.state.order
    if (payType === 0) {
      if (source !== 4) {
        return tradeType === 0 ? '微信公众号支付' : '微信APP支付'
      } else {
        return '微信支付'
      }
    } else if (payType === 1) {
      return '支付宝'
    } else {
      return '银联转账'
    }
  }

  refundModalShow = (orderItemId: number) => {
    this.setState({
      refundVisible: true,
      orderItemId
    })
  }
  refundModalClose = () => {
    this.setState({ refundVisible: false })
  }

  expressModalShow = (orderItemId: number) => {
    this.setState({
      expressVisible: true,
      orderItemId
    })
  }
  expressModalClose = () => {
    this.setState({expressVisible: false})
  }

  render () {
    const {
      order,
      order: { user, delivery, orderItems }
    }: any = this.state

    let columns = [
      {
        title: '商品图片',
        key: 'img',
        width: 100,
        className: 'goods-pic',
        render: (text: string, record: any, index: number) =>
          <img src={getPicSrc(record.mainPic)} alt=""/>
      },
      {
        title: '商品名称',
        dataIndex: 'productName',
        width: 200,
      },
      {
        title: 'sku',
        dataIndex: 'skuName',
        width: 150,
      },
      {
        title: '条形码',
        dataIndex: 'barcode',
        width: 150,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 100,
      },
      {
        title: '销售价',
        dataIndex: 'price',
        width: 100,
      },
      {
        title: '商品总价',
        key: 'totalPrice',
        width: 100,
        render: (text: string, record: any, index: number) => (record.price * record.quantity)
      },
      {
        title: '快递单号',
        key: 'deliveryNo',
        width: 150,
        render: (text: string, record: any, index: number) =>
          record.deliveryNo
            ? record.deliveryNo.split(';').map((item: any, index: number) =>
              <div key={index}>
                {item}
              </div>)
            : ''
      },
      {
        title: '快递公司',
        dataIndex: 'deliveryCompany',
        width: 100,
      }
    ]

    const includeStatus = [1, 2, 3].findIndex(item => item === order.status) > -1
    if (includeStatus) {
      columns.push({
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text: string, record: any, index: number) =>
          <div>
            {this.props.orderType === 'user' && record.completeRefund && '已全部退款' }
            {this.props.orderType === 'user' && !record.completeRefund &&
              <Button
                type="primary"
                onClick={this.refundModalShow.bind(this, record.id)}
              >退款</Button>
            }
          <Button
            type="primary"
            style={{marginLeft: 5}}
            onClick={this.expressModalShow.bind(this, record.id)}
          >更新物流</Button>
        </div>
      })
    }

    const tableConfig = {
      scroll: {
        x: includeStatus ? 1350 : 1150,
      //   y: 1,
      },
      columns: columns,
      dataSource: orderItems,
      rowKey: 'id',
      pagination: false,
    }

    const orderRemarkConfig = {
      orderId: this.props.orderId,
      orderRemark: order.remark,
    }

    const payAmount = Array.isArray(orderItems)
                      ? orderItems.reduce((sum: number, {price, quantity}: any) => sum + price * quantity, 0)
                      : 0

    const orderPayConfig = {
      orderId: this.props.orderId,
      payAmount: payAmount,
      forceUpdateData: this.getData,
    }

    const refundModalConfig = {
      visible: this.state.refundVisible,
      refundItemId: this.state.orderItemId,
      forceUpdateData: this.getData, // 强制组件重新获取值
      handleRefundModalClose: this.refundModalClose,
    }

    const updateExpressConfig = {
      visible: this.state.expressVisible,
      orderItemId: this.state.orderItemId,
      forceUpdateData: this.getData, // 强制组件重新获取值
      onCancel: this.expressModalClose,
    }

    return (
      <>
        <Card
          className="order-detail-info filter-header"
          title="订单信息"
          extra={
            <Tag>{['待付款', '待发货', '已发货', '已完成', '已取消'][order.status]}</Tag>
          }
        >
          <Row className="order-info">
            <Col span={12}>
              <h5>基本信息</h5>
              <Col span={6}>购买账号:</Col>
              <Col offset={4} span={12}>{user ? user.nickname : order.nickname}</Col>
              <Col span={6}>订单来源:</Col>
              <Col offset={4} span={12}>
                {order.source === 4
                  ? '手动创建订单'
                  : (order.source === 2 ? '微信商城' : 'APP')
                }
              </Col>
              {order.payStatus !== 0
                ? <>
                    <Col span={6}>支付方式:</Col>
                    <Col offset={4} span={12}>{this.computedPayType()}</Col>
                    <Col span={6}>实际支付费用:</Col>
                    <Col offset={4} span={12}>{order.payAmount} 元</Col>
                  </>
                : null
              }
              {order.source !== 4
                ? <>
                    <Col span={6}>优惠金额:</Col>
                    <Col offset={4} span={12}>{order.discountAmount + order.couponAmount} 元</Col>
                  </>
                : null
              }
              {typeof order.shipAmount !== 'undefined' && order.source !== 4
                ? <>
                    <Col span={6}>运费:</Col>
                    <Col offset={4} span={12}>{order.shipAmount} 元</Col>
                  </>
                : null
              }
              <Col span={6}>订单编号:</Col>
              <Col offset={4} span={12}>{order.orderNo}</Col>
              <Col span={6}>下单时间:</Col>
              <Col offset={4} span={12}>{moment(order.createTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
              {order.payTime
                ? <>
                    <Col span={6}>支付时间:</Col>
                    <Col offset={4} span={12}>{moment(order.payTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                  </>
                : null
              }
              {order.deliveryTime
                ? <>
                    <Col span={6}>发货时间:</Col>
                    <Col offset={4} span={12}>{moment(order.deliveryTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                  </>
                : null
              }
              {order.receiveTime
                ? <>
                    <Col span={6}>收货时间:</Col>
                    <Col offset={4} span={12}>{moment(order.receiveTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                  </>
                : null
              }
              {order.cancelTime
                ? <>
                    <Col span={6}>取消时间:</Col>
                    <Col offset={4} span={12}>{moment(order.cancelTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                  </>
                : null
              }
            </Col>
            <Col span={12}>
              <h5>地址信息信息</h5>
              <Col span={6}>收件人:</Col>
              <Col offset={4} span={12}>{delivery && delivery.receiver}</Col>
              <Col span={6}>手机号:</Col>
              <Col offset={4} span={12}>{delivery && delivery.tel ? delivery.tel : '无'}</Col>
              <Col span={6}>收货地址:</Col>
              {delivery &&
                <Col offset={4} span={12}>
                  {delivery.province.name}{delivery.city.name}{delivery.area.name}{delivery.address}
                </Col>
              }
            </Col>

            {order.orderImages
              ? <Col span={24}>
                  <Col span={4}>支付凭证:</Col>
                  <Col offset={1} span={17}>
                    {order.orderImages.map(({ image }: any, index: number) =>
                      <a
                        href={getPicSrc(image, { origin: true })}
                        key={index}
                        className="order-images"
                        target="_blank"
                      >
                         <img src={getPicSrc(image, {thumbnail: '150x'})} alt="付款凭证"/>
                       </a>
                     )}
                  </Col>
                </Col>
              : null
            }
          </Row>
        </Card>

        <Table {...tableConfig} />

        {/*退款单*/}
        <RefundModal {...refundModalConfig}/>

        {/*更新物流*/}
        <UpdateExpress {...updateExpressConfig}/>

        {/*备注信息*/}
        {this.props.needOrderRemark
          ? <OrderRemark {...orderRemarkConfig} />
          : null
        }

        {/*手动创建的订单并且还未支付时才显示这一块*/}
        {(order.status === 0 && this.props.orderType === 'admin')
          ? <OrderPay {...orderPayConfig} />
          : null
        }
      </>
    )
  }
}
