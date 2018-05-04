import * as React from 'react'
import { Row, Col, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import * as moment from 'moment'

import { adminAxios, history, getPicSrc, mainContentScroll } from '@Utilities'
import './index.less'

interface MallProductProps {
  mallProduct: {
    id?: number
    skus?: any[]
    name?: string
    description?: string
    status?: number
    limitCnt?: number
    freight?: number
    product?: {
      hasSku?: string
      images?: string[]
    }
    showTag?: string
    immediateOnShelf?: boolean | string
    onShelfTime?: number
    soldTime?: number
    offShelfTime?: number
    cornerMark?: string
    message?: {
      pushed?: boolean
      type?: number
      aheadOfMinute?: number
      content?: string
    }
  }
}

interface ListsUser {
  id?: number
}

export default class OnShelvesGoodsDetail extends React.Component {
  state: MallProductProps = {
    mallProduct: {
      // id: -1,
    }
  }

  componentDidMount () {
    const { location: { search } } = history
    const id = search.split('?')[1].split('=')[1]

    adminAxios.get(`/mall/product/${id}`).then(res => {
      this.setState({
        mallProduct: res.data.data
      })
    })

    // 页面高度自适应
    mainContentScroll()
    addEventListener('resize', mainContentScroll)
  }

  render () {
    const { mallProduct } = this.state

    if (!mallProduct.id) {
      return null
    }

    let columns: ColumnProps<ListsUser>[] = [
      {
        title: '条形码',
        dataIndex: 'productSku.barCode'
      },
      {
        title: '价格',
        dataIndex: 'price'
      },
      {
        title: '库存',
        dataIndex: 'inventory'
      }
    ]

    return (
      <div className="mall-goods-details">
        <Row gutter={16}>
          <Col span={2}>
            商品名称
          </Col>
          <Col span={12}>
            <p>{mallProduct.name}</p>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            商品描述
          </Col>
          <Col span={12}>
            <p>{mallProduct.description}</p>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            上架状态
          </Col>
          <Col span={12}>
            <div><Tag color="green">{mallProduct.status === 1 ? '已上架' : '预约上架'}</Tag></div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            购买限制
          </Col>
          <Col span={12}>
            <p>{mallProduct.limitCnt}</p>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={2}>
            快递费用
          </Col>
          <Col span={12}>
            <p>{mallProduct.freight} 元</p>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            {mallProduct.product && mallProduct.product.hasSku ? 'sku' : ''}属性
          </Col>
          <Col span={20}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={mallProduct.skus}
              pagination={false}
            />
          </Col>
        </Row>

        {
          mallProduct.showTag ? (
            <Row gutter={16}>
              <Col span={2}>
                商品描述标签
              </Col>
              <Col span={12}>
                {
                  mallProduct.showTag.split('#').map((text, index) => (
                    <Tag key={index}> {text}</Tag>
                  ))
                }
              </Col>
            </Row>
          ) : null
        }

        <Row gutter={16}>
          <Col span={2}>
            立即上架
          </Col>
          <Col span={12}>
            {mallProduct.immediateOnShelf ? '是' : '否'}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            上架时间
          </Col>
          <Col span={12}>
            {moment(mallProduct.onShelfTime).format('YYYY-MM-DD HH:mm:ss')}
          </Col>
        </Row>

        {
          mallProduct.soldTime
            ? ( <Row gutter={16}>
                  <Col span={2}>
                    开售时间
                  </Col>
                  <Col span={12}>
                    {moment(mallProduct.soldTime).format('YYYY-MM-DD HH:mm:ss')}
                  </Col>
                </Row>
              )
            : null
        }

        {mallProduct.offShelfTime
          ? ( <Row gutter={16}>
                <Col span={2}>
                  下架时间
                </Col>
                <Col span={12}>
                  {moment(mallProduct.offShelfTime).format('YYYY-MM-DD HH:mm:ss')}
                </Col>
              </Row>
            )
          : null
        }

        <Row gutter={16}>
          <Col span={2}>
            商品图片
          </Col>
          <Col span={12}>
            <>
              {mallProduct.product && Array.isArray(mallProduct.product.images) && mallProduct.product.images.map((src, index) => (
                 <img key={index} src={getPicSrc(src)} alt="" style={{width: 100}}/>
              ))}
            </>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={2}>
            商品角标
          </Col>
          <Col span={12}>
            {
              mallProduct.cornerMark
              ? <img
                  src={getPicSrc(mallProduct.cornerMark)}
                  alt="cornerMark"
                  style={{width: 50}}
                />
              : '无'
            }
          </Col>
        </Row>

        {
          mallProduct.message ? (
            <Row gutter={16}>
              <Col span={2}>
                推送消息
              </Col>
              <Col span={12}>
                <Col span={6}>已经推送</Col>
                <Col span={14}>{ mallProduct.message.pushed ? '是' : '否'}</Col>
                <Col span={6}>推送类型</Col>
                <Col span={14}>{ mallProduct.message.type === 1 ? '上架时推送' : '开售前推送'}</Col>
                <Col span={6}>推送提前时间</Col>
                <Col span={14}>{ mallProduct.message.aheadOfMinute }分钟</Col>
                <Col span={6}>推送内容</Col>
                <Col span={14}>{ mallProduct.message.content}</Col>
              </Col>
            </Row>
          ) : null
        }
      </div>
    )
  }
}
