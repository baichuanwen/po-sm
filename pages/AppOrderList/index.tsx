import * as React from 'react'
import { Link } from 'react-router-dom'
import { Input, Select, DatePicker, Tabs, Table, Button, Modal, Icon, Upload, message } from 'antd'
import * as moment from 'moment'
import { Moment } from 'moment/moment.d'

import { adminAxios, getPicSrc, initTableScroll, pagesRouter, history } from '@Utilities'
import './index.less'

const keywordNames = [
  { id: 'orderNo', name: '订单号' },
  { id: 'receiver', name: '收货人姓名' },
  { id: 'tel', name: '手机号' },
  { id: 'productName', name: '商品名' },
  { id: 'nickname', name: '用户名' },
  { id: 'deliveryNo', name: '快递单号' },
  { id: 'barCode', name: '条形码' },
]
let statusOptions = [
  { id: -1, name: '全部' },
  { id: 0, name: '待付款' },
  { id: 1, name: '待发货' },
  { id: 2, name: '已发货' },
  { id: 3, name: '已完成' },
  { id: 4, name: '已取消' },
]
const Option = Select.Option
const Search = Input.Search
const RangePicker = DatePicker.RangePicker
const TabPane = Tabs.TabPane

interface ParamsProps {
  type: null | number | string
  keyword: null | string
  categoryId: null | number | string
  keywordName: string
  page: number
  size: number
  status: null | number | string
  startTime: null | string | number
  endTime: null | string | number
  source: string
}

export default class AppOrderList extends React.Component {
  state = {
    token: localStorage.getItem('SMS_ADMIN_TOKEN'),

    content: [],
    loading: false,

    totalElements: 0,
    totalPages: 0,
    numberOfElements: 0,//当页订单数
    productCnt: 0,//当页订单商品数
    orderTotalAmount: 0,

    params: {
      type: null,
      keyword: null,
      categoryId: null,
      keywordName: 'orderNo',
      page: 0,
      size: 50,
      status: null, // 查询订单的参数
      startTime: null,
      endTime: null,
      source: 'user' // 订单的来源 用户创建或者后台手动创建
    },

    isBigPic: false,

    visible: false,
    fileList: [],
    confirmLoading: false,
  }

  componentDidMount () {
    const { location: { pathname } } = history
    const newSource = pathname.includes('manualorder') ? 'admin' : 'user'

    const newParams = {
      ...this.state.params,
      source: newSource
    }
    this.getData(newParams)

    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)
  }

  getData = (params: ParamsProps) => {
    this.setState({ loading: true })
    adminAxios.get('/order', { params }).then((res) => {
      const {
        content,
        totalPages,
        totalElements,
        numberOfElements,
      } = res.data.data
      let orderTotalAmount = 0
      let productCnt = 0
      // 对于手动创建的订单没必要计算这些值
      if (params.source === 'user') {
        content.forEach((order: any) => {
          orderTotalAmount = orderTotalAmount + order.payAmount * 100
          order.orderItems.forEach((orderItem: any) => {
            productCnt = productCnt + orderItem.quantity
          })
        })
        orderTotalAmount = orderTotalAmount / 100
      }
      this.setState({
        loading: false,
        params,

        content,
        totalPages,
        totalElements,
        numberOfElements,
        productCnt,
        orderTotalAmount
      })
    })

    // this.getTotalAmount()
  }

  handleTabChange = (key: any) => {
    key = parseInt(key, 10)
    // const newStatus = key !== -1 ? key : null
    const newParams = {
      ...this.state.params,
      page: 0, // 重置分页数据
      status: key !== -1 ? key : null
    }
    this.getData(newParams)
  }

  // 筛选数据
  handleSearch = (value: string) => {
    console.log(value)
    const newParams = {
      ...this.state.params,
      keyword: value.trim() ? value.trim() : null,
      page: 0,
    }

    this.getData(newParams)
  }

  handleKeywordNameChange = (value: string) => {
    this.setState({
      params: {
        ...this.state.params,
        page: 0, // 重置分页数据
        keywordName: value,
      }
    })
  }

  handleTimeChange = (date: Moment[], dateString: string[]) => {
    let startTime = null;
    let endTime = null;
    let [ startDay, endDay ] = dateString
    if (startDay && endDay) {
      // 在 iPad 上日期格式化存在问题，所以这里使用了跨平台的 moment.js 来处理
      startTime = moment(`${startDay} 00:00:00`).valueOf()
      endTime = moment(`${endDay} 23:59:59`).valueOf()
    }

    const newParams = {
      ...this.state.params,
      startTime,
      endTime,
    }
    this.getData(newParams)
  }

  // 切换大图
  handleClickBigPic = () => {
    this.setState({ isBigPic: !this.state.isBigPic })
  }

  handlePageChange = (page: number) => {
    const newParams = {
      ...this.state.params,
      page: page - 1 // 分页是从0开始
    }
    this.getData(newParams)
  }

  showModal = () => {
    this.setState({visible: true})
  }
  handleModalCancel = () => {
    this.setState({visible: false})
  }
  handleOk = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const { fileList } = this.state
    if (!fileList.length) {
      message.error('请选择文件!')
      return false
    }


    const formData = new FormData()
    formData.append('file', fileList[0])

    this.setState({ confirmLoading: true })
    return adminAxios.post('/order/batch/import', formData).then(res => {
      const { errors } = res.data.data
      if (errors.length) {
        return Modal.error({
          title: '提示',
          content: (
            <div>
              {errors.map(({message, orderNo, row}: any, index: number) => (
                <p key={index}>
                  第{row}行，订单编号: {orderNo}，错误信息: {message}
                </p>
              ))}
            </div>
          )
        })
      }
      this.setState({
        confirmLoading: false,
        visible: false
      })
      return message.success('导入成功')
    }).catch(err => {
      this.setState({confirmLoading: false})
    })
  }
  beforeUpload = (file: any) => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('上传的文件大小不能超过2M！')
    } else {
      this.setState({fileList: [file]})
    }
    return false
  }
  handleRemove = () => {
    this.setState({fileList: []})
  }

  // 导出数据
  exportData = () => {
    const { token, params, totalElements } = this.state
    if (totalElements > 5000) {
      message.error('导出的数据大于5000条，请选择筛选条件')
      return
    }
    const query = {
      token,
      ...params
    }
    const queryStr = Object.keys(query).filter(key => query[key] !== null).map(key => `${key}=${query[key]}`).join('&')
    window.open(`${window.location.origin}/admin/order/batch/export?${queryStr}`)
  }

  render () {
    const { params, isBigPic } = this.state
    const columns = [
      {
        title: '订单编号',
        dataIndex: 'orderNo',
        width: 200
      },
      {
        title: '商品信息',
        key: 'info',
        width: 300,
        className: 'info',
        render: (text: any, record: any, index: number) => {
          return record.orderItems.map((item: any, index: number) => {
            const { mainPic, price, productName, quantity } = item
            return (
              <div key={index}>
                <img src={getPicSrc(mainPic)} alt="" className={isBigPic ? 'bigger' : 'smaller'} />
                <div className="price">
                  <h4 style={{fontWeight: 'bold'}}>{productName}</h4>
                  <h5>售价: {price}元</h5>
                  <h5>{quantity}件</h5>
                </div>
              </div>
            )
          })
        },
      },
      {
        title: '实付价格',
        key: 'payAmount',
        width: 100,
        render: (text: number, record: any, index: number) => (record.payAmount ? record.payAmount + '元' : '')
      },
      {
        title: '购买用户',
        key: 'nickname',
        render: (text: number, record: any, index: number) => record.nickname ? record.nickname : record.user.nickname,
        width: 150
      },
      {
        title: '下单时间',
        dataIndex: 'createTime',
        width: 200,
        render: (text: number, record: any, index: number) => moment(record.createTime).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '订单状态',
        key: 'status',
        width: 100,
        render: (text: number, record: any, index: number) => (['待付款', '待发货', '已发货', '已完成', '已取消'][record.status])
      },
      {
        title: '订单备注',
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: '操作',
        key: 'operator',
        width: 100,
        render: (text: number, record: any, index: number) =>
          <Link
            to={`${params.source === 'user' ? pagesRouter.AppOrderDetail : pagesRouter.ManualOrderDetail}?id=${record.orderNo}`}
            // target='_blank'
          >查看</Link>
      }
    ]

    const tableConfig = {
      scroll: {
        x: 1350,
        y: 1,
      },
      // loading: this.state.loading,
      columns: columns,
      dataSource: this.state.content,
      rowKey: 'orderNo',
      pagination: {
        defaultCurrent: 1,
        current: params.page + 1,
        pageSize: params.size,
        total: this.state.totalElements,
        onChange: this.handlePageChange,
      },
    }

    if (this.state.params.source === 'admin') {
      statusOptions = statusOptions.filter(({name}: { name: string }) => name !== '已取消')
    }

    return (
      <div className="app-order-list">
        <div className="filter-header">
          <div>
            <span className="keyword">关键字类型:</span>
            <Select defaultValue="orderNo" onChange={this.handleKeywordNameChange}>
              {keywordNames.map(item => (
                <Option key={item.id} value={item.id.toString()}>
                  {item.name}
                </Option>)
              )}
            </Select>
            <Search
              className="header-search"
              placeholder="关键字搜索"
              enterButton={true}
              onSearch={this.handleSearch}
            />
            <RangePicker onChange={this.handleTimeChange}/>
          </div>

          <div>
            {params.status === 1 && params.source === 'user'
              ? <Button type="primary" onClick={this.showModal}>发货</Button>
              : null
            }

            {(params.source === 'user' && (params.status === null || params.status === 1))
              ? <Button type="primary" onClick={this.exportData}>导出</Button>
              : null
            }

            {params.source === 'admin'
              ? <Button type="primary">
                  <Link to={pagesRouter.CreateManualOrder}>手动创建订单</Link>
                </Button>
              : null
            }
            <Button type="primary" onClick={this.handleClickBigPic}> {isBigPic ? '小图' : '大图'}</Button>
          </div>
        </div>

        <Tabs defaultActiveKey="-1" onChange={this.handleTabChange}>
          {statusOptions.map(({id, name}) => (
            <TabPane tab={name} key={id}/>
          ))}
        </Tabs>

        <Table {...tableConfig}/>

        {params.source === 'user'
          ? <p className="footer-remark">
              <span>商品数: <b>{this.state.productCnt}</b></span>
              <span>订单金额: <b>{this.state.orderTotalAmount}</b></span>
              <span>订单数: <b>{this.state.numberOfElements}</b></span>
            </p>
          : null
        }

        <Modal
          title="批量发货"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleModalCancel}
          confirmLoading={this.state.confirmLoading}
        >
          <Upload
            accept=".xls"
            action="http://upload.qiniu.com/"
            fileList={this.state.fileList}
            beforeUpload={this.beforeUpload}
            onRemove={this.handleRemove}
          >
            <Button>
              <Icon type="upload"/> 上传.xls文件
            </Button>
          </Upload>
          <p style={{lineHeight: '32px'}}>
            模板文件
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://obxf7cs2k.qnssl.com/jiuhuar/mall/导入模板新.xls"
            >
              点击这里
            </a>
            下载
          </p>
        </Modal>
      </div>
    )
  }
}
