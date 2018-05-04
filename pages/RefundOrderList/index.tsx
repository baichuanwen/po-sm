/**
 * Created by zhiyang on 2017/10/16.
 */
import * as React from 'react'
import { Link } from 'react-router-dom'
import { Table, Select, Input, DatePicker, Button, message } from 'antd'
import * as moment from 'moment'
import { Moment } from 'moment/moment.d'

import { adminAxios, initTableScroll, pagesRouter } from '@Utilities'

const Search = Input.Search
const Option = Select.Option
const RangePicker = DatePicker.RangePicker

class RefundOrderList extends React.Component {
  state = {
    token: localStorage.getItem('SMS_ADMIN_TOKEN'),
    content: [],
    totalElements: 0,
    totalPages: 0,
    params: {
      type: null,
      keyword: null,
      categoryId: null,
      keywordName: 'orderNo',
      page: 0,
      size: 50,
      status: null, // 查询订单的参数
      startTime: null,
      endTime: null
    },
    keywordNames: [{id: 'orderNo', name: '订单号'}, {id: 'refundNo', name: '退款编号'}, {id: 'productName', name: '商品名'}, {id: 'nickname', name: '用户名'}]
  }

  getData = () => {
    const params = {...this.state.params}
    adminAxios.get('/refund', {params}).then(res => {
      const { content, totalPages, totalElements } = res.data.data
      this.setState({
        content,
        totalPages,
        totalElements
      })
    })
  }

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
    window.open(`${window.location.origin}/admin/refund/export?${queryStr}`)
  }
  // 筛选数据
  handleSearch = (value: string) => {
    const keyword = value.trim() ? value.trim() : null
    const {params} = this.state
    this.setState({
      params: {
        ...params,
        page: 0,
        keyword
      }
    }, this.getData)
  }

  handleKeywordNameChange = (value: string) => {
    const { params } = this.state
    this.setState({
      params: {
        ...params,
        page: 0, // 重置分页数据
        keywordName: value
      }
    })
  }
  handlePageChange = ({ current }: { current: number }) => {
    const {params} = this.state
    this.setState({
      params: {
        ...params,
        page: current - 1 // 分页是从0开始
      }
    }, this.getData)
  }

  handleTimeChange = (date: Moment[], dateString: string[]) => {
    let startTime = null, endTime = null
    let [ startDay, endDay ] = dateString
    if (startDay && endDay) {
      startTime = new Date(`${startDay} 00:00:00`).getTime()
      endTime = new Date(`${endDay} 23:59:59`).getTime()
    }
    const { params } = this.state
    this.setState({
      params: {
        ...params,
        startTime,
        endTime
      }
    }, this.getData)
  }

  componentDidMount () {
    this.getData()

    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)
  }

  render () {
    const { keywordNames } = this.state
    const columns = [
      {
        title: '退款编号',
        dataIndex: 'refundNo',
        width: 200,
      },
      {
        title: '订单编号',
        dataIndex: 'orderNo',
        width: 200,
      },
      {
        title: '退款时间',
        key: 'time',
        width: 200,
        render: (text: string, record: any, index: number) => moment(record.createTime).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '退款商品',
        dataIndex: 'orderItem.productName',
        width: 200,
      },
      {
        title: '退款金额',
        dataIndex: 'refundAmount',
        width: 100,
      },
      {
        title: '库存变化',
        dataIndex: 'inventoryUpdateCnt',
        width: 100,
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        width: 150,
      },
      {
        title: '操作',
        key: 'operate',
        width: 150,
        render: (text: string, record: any, index: number) => <Link to={`${pagesRouter.RefundOrderDetail}?id=${record.id}`}>退款详情</Link>
      }
    ]

    const tableConfig = {
      scroll: {
        x: 1300,
        y: 1,
      },
      columns: columns,
      dataSource: this.state.content,
      rowKey: 'id',
      onChange: this.handlePageChange,
      pagination: {
        total: this.state.totalElements,
        current: this.state.params.page + 1,
        pageSize: this.state.params.size
      },
    }

    return (
      <div>
        <div className="content-header filter-header">
          {/* <h3 className="title">退款订单</h3> */}
          <div>
            <span>关键字类型:</span>
            <Select placeholder="默认订单号" onChange={this.handleKeywordNameChange} style={{width: 140}}>
              {keywordNames.map(item => (<Option key={item.id} value={item.id.toString()}>
                {item.name}
              </Option>))}
            </Select>
            <Search className="header-search" style={{width: 160}} placeholder="关键字搜索" onSearch={this.handleSearch}/>
            <RangePicker style={{marginLeft: '10px'}} onChange={this.handleTimeChange}/>
          </div>

          <div>
            <Button
              type="primary"
              onClick={this.exportData}
              style={{marginLeft: 5}}
            >导出</Button>
          </div>
        </div>
        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default RefundOrderList
