import * as React from 'react'
import { Select, Button, Input, Table, Modal, message, DatePicker, Icon } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { ModalProps } from 'antd/lib/modal/Modal'
// import { RadioGroupProps } from 'antd/lib/radio'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Link } from 'react-router-dom'
import * as moment from 'moment'

import { axios, initTableScroll, pagesRouter, history } from '@Utilities'
import './index.less'

const { Option } = Select
const { Search } = Input
const { RangePicker } = DatePicker

interface PageParams {
  page?: number,
  size?: number,
  keyword?: string,
  warehouseId?: number | string,
  status?: string
  startTime?: string
  endTime?: string
}

interface ListsUser {
  height?: number
  key: number
  id?: number
  name: string
  cnName?: string
  enName?: string
  createTime: number
  hasSku: boolean
  mainPic: string
  totalQty?: number
  price: number
  tags: string
  loading?: boolean
  pagination?: boolean
}

interface Order {
  id: number
  code: string
  count: number
  amount: number
  createTime: number
  respository: string
  status: number
  warehouseId: number
}

interface Warehouse {
  id?: number | string
  name?: string
  cnName?: string
  enName?: string
}

interface NewModalProps extends ModalProps {
  warehouseList: Warehouse[]
  warehouseId: number
}

class GoodsOutbound extends React.Component<InjectedIntlProps & NewModalProps> {
  state = {
    loading: false,
    warehouseModalVisible: false,
    sendEmailModalVisible: false,
    mailData: {
      receivers: [],
      templates: [],
      id: undefined
    },
    totalElements: 10,
    // content: [],
    warehouseList: [
      {
        id: '0',
        name: this.props.intl.formatMessage({id: 'POList.allWareHouse', defaultMessage: '全部'})
      }
    ],
    warehouseId: '0',
    total: 0,
    dataSource: [],
    params: {
      page: 1,
      size: 10,
      keyword: '',
      warehouseId: 0,
      // status: '',
      startTime: '',
      endTime: '',
    }
  }

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  // 卸载方法
  componentWillUnmount () {
    removeEventListener('resize', initTableScroll)
  }

  componentWillMount () {
    const { intl: { locale, formatMessage } } = this.props
    axios.get('/warehouse').then(res => {
      const { data } = res.data

      const newWarehouseList = data.length > 1
        ? [{id: '0', name: formatMessage({id: 'POList.allWareHouse', defaultMessage: '全部'})}].concat(
            data.map((item: Warehouse) => ({
              ...item,
              id: `${item.id}`,
              name: locale === 'zh' ? item.cnName : item.enName
            }))
          )
        : data.map((item: Warehouse) => ({
            ...item,
            id: `${item.id}`,
            name: locale === 'zh' ? item.cnName : item.enName
          }))
      this.setState({
        warehouseList: newWarehouseList,
        warehouseId: `${data[0].id}`,
      })
    })
  }

  componentDidMount () {
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)

    this.getWarehouseList(this.state.params)
  }

  /**
   * 获取商品列表
   */
  getWarehouseList = (params: PageParams) => {
    axios.get('/warehouse/out', { params }).then(res => {
      const {
        data,
        data: {
          list,
        },
      } = res.data

      const {
        intl: { locale }
      } = this.props

      this.setState({
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword,
          warehouseId: params.warehouseId,
          startTime: params.startTime,
          endTime: params.endTime,
        },

        total: data.total,
        originData: data,
        dataSource: list.map((item: ListsUser) => (
          { ...item,
            name: locale === 'zh' ? item.cnName : item.enName,
            key: item.id,
            createTime: moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
          }
        )),
      })
    })
  }

  filterByOutWarehouseNo = (keyword: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      keyword: keyword,
    }

    this.getWarehouseList(params)
  }

  // tslint:disable-next-line
  filterByTime = (time: any) => {
    const params = {
      ...this.state.params,
      startTime: moment(time[0]).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(time[1]).format('YYYY-MM-DD HH:mm:ss'),
    }
    this.getWarehouseList(params)
  }

  filterByRepo = (value: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      warehouseId: value,
    }
    this.getWarehouseList(params)
  }

  pageChange = (page: number) => {
    const params = {
      ...this.state.params,
      page: page,
    }

    this.getWarehouseList(params)
  }

  deleteOrder = (id: number) => {
    axios.delete(`/purchase/${id}`).then(res => {
      const { data } = res
      this.setState({ saveButtonLoading: false })
      if (data.code === 0) {
        message.success('采购订单删除成功')
        this.getWarehouseList(this.state.params)
      }
    })
  }

  handleGroupChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value
    return value
    // console.log(`value is ${value}`)
  }

  /**
   * add po
   */
  addNewOutbound = () => {
    if (this.state.warehouseList.length > 1) {
      return this.setState({ warehouseModalVisible: true })
    }

    history.push(`${pagesRouter.WarehouseOutboundlistCreate}?warehouseid=${this.state.warehouseId}`)
  }

  headToAddNewPO = () => {
    history.push(`${pagesRouter.WarehouseOutboundlistCreate}?warehouseid=${this.state.warehouseId}`)
  }

  selectWarehouse = (value: string) => {
    this.setState({ warehouseId: value })
  }

  hideModal = () => this.setState({ warehouseModalVisible: false })

  render() {
    const {
      intl: { locale, formatMessage }
    } = this.props

    const columns: ColumnProps<Order>[] = [
      {
        title: formatMessage({id: 'GoodsOutbound.outWarehouseNo', defaultMessage: '出库单号'}),
        dataIndex: 'outWarehouseNo',
        fixed: 'left',
        width: 180 // 200
      },
      {
        title: formatMessage({id: 'GoodsOutbound.createTime', defaultMessage: '出库日期'}),
        // key: 'createTime',
        dataIndex: 'createTime',
        width: 200
      },
      {
        title: formatMessage({id: 'GoodsOutbound.warehouse', defaultMessage: '所属仓库'}),
        dataIndex: 'warehouseId',
        width: 150,
        render: (warehouseId) => {
          if (this.state.warehouseList.length >= 1) {
            // tslint:disable-next-line
            const filterWarehouse: any = this.state.warehouseList.filter((item: Warehouse) =>
              `${item.id}` === `${warehouseId}`
            )

            if (filterWarehouse.length > 0) {
              return <span>{filterWarehouse[0].name}</span>
            }
          }
          return null
        }
      },
      {
        title: formatMessage({id: 'GoodsOutbound.outboundQuantity', defaultMessage: '出库数量'}),
        dataIndex: 'quantity',
        width: 120
      },
      {
        title: formatMessage({id: 'GoodsOutbound.remark', defaultMessage: '备注信息'}),
        dataIndex: 'remark',
        width: 100
      },
      {
        title: formatMessage({id: 'GoodsOutbound.operation', defaultMessage: '操作'}),
        // title: formatMessage({id: 'operation', defaultMessage: 'eeee我'}),
        key: 'operation',
        width: 150,
        render: (text, record, index) => {
          const { warehouseId, id } = record
          return (
            <Link to={`${pagesRouter.WarehouseOutboundlistView}?warehouseid=${warehouseId}&outboundid=${id}`}>
              {formatMessage({ id: 'GoodsOutbound.detail', defaultMessage: '详情'})}
            </Link>
          )
        }
      }
    ]

    const modalConfig = {
      className: 'warehouse-modal',
      title: formatMessage({ id: 'GoodsOutbound.selectWarehouse', defaultMessage: '选择仓库'}),
      visible: this.state.warehouseModalVisible,
      okText: formatMessage({ id: 'GoodsOutbound.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'GoodsOutbound.cancel', defaultMessage: '取消'}),
      onOk: this.headToAddNewPO,
      onCancel: this.hideModal,
    }

    const tableConfig = {
      className: 'page-content',
      scroll: {
        x: 1150,
        y: 1,
      },
      loading: this.state.loading,
      columns: columns,
      dataSource: this.state.dataSource,
      pagination: {
        defaultCurrent: 1,
        current: this.state.params.page,
        total: this.state.total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10'],
        onChange: this.pageChange,
      },
    }

    return (
      <div className="goods-outbound-list">
        <Modal {...modalConfig}>
          <Select
            style={{width: 300}}
            placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择'})}
            onChange={this.selectWarehouse}
            defaultValue={this.state.warehouseId}
          >
            {this.state.warehouseList.filter(item => `${item.id}` !== '0').map((item: Warehouse) =>
              <Option key={`warehouse${item.id}`} value={`${item.id}`}>{item.name}</Option>
            )}
          </Select>
        </Modal>

        <header className="outbound-list-filter-header filter-header">
          <div className="filter-select">
            <span className="range-time-title">
            {formatMessage({id: 'GoodsOutbound.outboundTime', defaultMessage: '出库时间'})}:
            </span>
            <RangePicker
              className="outbound-time"
              onChange={this.filterByTime}
            />
            <span className="range-time-title">
            {formatMessage({id: 'GoodsOutbound.warehouse', defaultMessage: '所属仓库'})}:
            </span>
            <Select
              className="warehouse-select"
              style={{width: locale === 'zh' ? 100 : 160 }}
              defaultValue={this.state.warehouseId}
              onChange={this.filterByRepo}
            >
              {this.state.warehouseList.map(item =>
                <Option key={`${item.id}warehouse`} value={item.id}>{item.name}</Option>
              )}
            </Select>
          </div>

          <div className="filter-input">
            <Button type="primary" className="create-button" onClick={this.addNewOutbound}>
            {formatMessage({id: 'GoodsOutbound.addOutbound', defaultMessage: '新增出库'})}
            </Button>
            <Search
              placeholder={formatMessage({id: 'GoodsOutbound.outWarehouseNoRequired', defaultMessage: '请输入搜索内容'})}
              className="search-input"
              enterButton={<Icon type="search" />}
              onSearch={this.filterByOutWarehouseNo}
            />
          </div>
        </header>
        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default injectIntl(GoodsOutbound)
