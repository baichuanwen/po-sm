/**
 * Created by zhiyang on 2017/10/16.
 */
import * as React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Button, Card, Table } from 'antd'
import * as moment from 'moment'
// import { Moment } from 'moment/moment.d'

// import { dateFormat } from '../../common/utils'
import { adminAxios, getPicSrc, history, pagesRouter } from '@Utilities'

interface OrderItemProps {
  barcode: string
  completeRefund: boolean
  deliveryCompany: string
  deliveryNo: string
  freight: number
  id: number
  mainPic: string
  originPrice: number
  price: number
  productName: string
  quantity: number
}

interface RefundProps {
  createTime?: any
  id?: number
  inventoryUpdateCnt?: number
  operator?: string
  orderNo?: string
  quantity?: number
  refundAmount?: number
  refundDesc?: string
  refundDirection?: number
  refundNo?: string
  orderItem?: OrderItemProps
}

interface UserProps {
  address?: string
  nickname?: string
  receiver?: string
  tel?: string
}

interface ListProps {
  key: number
  quantity?: number
  refundAmount?: number
  mainPic: string
  productName: string
}

class RefundDetail extends React.Component {
  state = {
    orderId: -1,
    refundId: '',
    refund: {},
    user: {}
  }

  getData = () => {
    adminAxios.get(`/refund/${this.state.orderId}`).then(res => {
      const { refund, user } = res.data.data
      this.setState({ refund, user })
    })
  }

  componentDidMount () {
    const { location: { search } } = history
    const orderId = search.split('=')[1]

    // console.log('退款单号是 ', orderId)
    this.setState({
      orderId: orderId
    }, this.getData)
  }

  render () {
    const { refund, user }: { refund: RefundProps, user: UserProps } = this.state
    let dataSource: ListProps[] = []
    const columns = [
      {
        title: '商品图片',
        key: 'img',
        width: 200,
        render: (text: string, record: ListProps, index: number) => <img src={getPicSrc(record.mainPic)} alt="" style={{width: '80px'}}/>
      },
      {
        title: '商品名称',
        dataIndex: 'productName',
        width: 200,
      },
      {
        title: '退款商品数量',
        dataIndex: 'quantity',
        width: 150,
      },
      {
        title: '退款总额',
        dataIndex: 'refundAmount',
        width: 150,
      }
    ]

    if (refund.orderItem) {
      const { quantity, refundAmount } = refund
      const { mainPic, productName } = refund.orderItem
      dataSource.push({ key: 1, quantity, refundAmount, mainPic, productName })
    }

    return (
      <div>
        <div className="content-header filter-header">
          <h3 className="title">退款详情</h3>
          <Button type="primary" style={{float: 'right'}}>
            <Link to={pagesRouter.RefundOrderList}>返回</Link>
          </Button>
        </div>
        <Card title="退款信息" style={{marginBottom: '30px'}}>
          <Row style={{lineHeight: '28px'}}>
            <Col span={12}>
              <h5 >基本信息</h5>
              <Col span={6}>退款编号:</Col>
              <Col offset={4} span={12}>{ refund.refundNo }</Col>
              <Col span={6}>订单编号:</Col>
              <Col offset={4} span={12}>{ refund.orderNo }</Col>
              <Col span={6}>退款时间:</Col>
              <Col offset={4} span={12}>
                {refund.createTime ? moment(refund.createTime).format('YYYY-MM-DD HH:mm:ss') : null}
              </Col>
              <Col span={6}>退款金额:</Col>
              <Col offset={4} span={12}>{ refund.refundAmount } 元</Col>
              <Col span={6}>库存变化:</Col>
              <Col offset={4} span={12}>{ refund.inventoryUpdateCnt }</Col>
              <Col span={6}>退款流向:</Col>
              <Col offset={4} span={12}>{ refund.refundDirection === 0 ? '微信' : '支付宝' }</Col>
              <Col span={6}>退款原因:</Col>
              <Col offset={4} span={12}>{ refund.refundDesc }</Col>
            </Col>
            <Col span={12}>
              <h5 style={{lineHeight: '36px'}}>基本信息</h5>
              <Col span={6}>用户名:</Col>
              <Col offset={4} span={12}>{ user.nickname }</Col>
              <Col span={6}>收件人:</Col>
              <Col offset={4} span={12}>{ user.receiver }</Col>
              <Col span={6}>联系方式:</Col>
              <Col offset={4} span={12}>{ user.tel }</Col>
              <Col span={6}>收货地址:</Col>
              <Col offset={4} span={12}>{ user.address }</Col>
            </Col>
          </Row>
        </Card>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </div>
    )
  }
}

export default RefundDetail
