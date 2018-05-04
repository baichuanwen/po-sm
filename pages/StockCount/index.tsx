import * as React from 'react'
import { Select, Button, Input, Table, Modal, DatePicker } from 'antd'
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
  remark?: string
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

class StockCount extends React.Component<InjectedIntlProps & NewModalProps> {
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
      // keyword: '',
      warehouseId: 0,
      startTime: '',
      endTime: '',
    }
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

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  // 卸载方法
  componentWillUnmount () {
    removeEventListener('resize', initTableScroll)
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
    axios.get('/verification', { params }).then(res => {
      const {
        data,
        data: {
          list,
        },
      } = res.data

      const {
        intl: { locale, formatMessage }
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
            createTime: moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
            remark: item.remark
              ? item.remark
              : formatMessage({ id: 'AddNewStockCount.noRemark', defaultMessage: '暂无' })
          }
        )),
      })
    })
  }

  filterByKeyword = (keyword: string) => {
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

  /**
   * add po
   */
  addNewStockCount = () => {
    if (this.state.warehouseList.length > 1) {
      return this.setState({ warehouseModalVisible: true })
    }

    history.push(`${pagesRouter.WarehouseCountlistCreate}?warehouseid=${this.state.warehouseId}`)
  }

  headToAddNewPO = () => {
    history.push(`${pagesRouter.WarehouseCountlistCreate}?warehouseid=${this.state.warehouseId}`)
  }

  selectWarehouse = (value: string) => {
    this.setState({ warehouseId: value })
  }

  hideModal = () => this.setState({ warehouseModalVisible: false })

  render() {
    const {
      intl: { locale, formatMessage }
    } = this.props

    // const { warehouseId: whId } = this.state
    const columns: ColumnProps<Order>[] = [
      {
        title: formatMessage({id: 'StockCount.verificationNo', defaultMessage: '出库单号'}),
        dataIndex: 'verificationNo',
        fixed: 'left',
        width: 180 // 200
      },
      {
        title: formatMessage({id: 'StockCount.createTime', defaultMessage: '出库日期'}),
        // key: 'createTime',
        dataIndex: 'createTime',
        width: 200
      },
      {
        title: formatMessage({id: 'StockCount.warehouse', defaultMessage: '所属仓库'}),
        dataIndex: 'warehouseId',
        width: 180,
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
        title: formatMessage({id: 'StockCount.bookTotal', defaultMessage: '账面总数'}),
        dataIndex: 'bookTotal',
        width: 120
      },
      {
        title: formatMessage({id: 'StockCount.actualTotal', defaultMessage: '实盘总数'}),
        dataIndex: 'actualTotal',
        width: 120
      },
      {
        title: formatMessage({id: 'StockCount.status', defaultMessage: '状态'}),
        dataIndex: 'status',
        width: 150,
        render: (operation, record, index) => {
          if (record.status === 0) {
            return (
              <span className="status-warn">
              {formatMessage({ id: 'StockCount.notCounted', defaultMessage: '未盘点'})}
              </span>
            )
          }
          return (
            <span className="status-primary">
            {formatMessage({ id: 'StockCount.counted', defaultMessage: '已盘点'})}
            </span>
          )
        }
      },
      {
        title: formatMessage({id: 'StockCount.operation', defaultMessage: '操作'}),
        // title: formatMessage({id: 'operation', defaultMessage: 'eeee我'}),
        dataIndex: 'operation',
        key: 'operation',
        // fixed: 'right',
        className: 'operation',
        width: 150,
        render: (operation, record, index) => {
          const { warehouseId: whId, id, status } = record
          if (status === 0) {
            return <>
              <Link to={`${pagesRouter.WarehouseCountlistView}?warehouseid=${whId}&inventoryid=${id}`}>
                {formatMessage({ id: 'StockCount.detail', defaultMessage: '详情'})}
              </Link>
              <Link to={`${pagesRouter.WarehouseCountlistInventory}?warehouseid=${whId}&inventoryid=${id}`}>
                {formatMessage({ id: 'StockCount.inventory', defaultMessage: '盘点'})}
              </Link>
            </>
          }

          return (
            <Link to={`${pagesRouter.WarehouseCountlistView}?warehouseid=${whId}&inventoryid=${id}`}>
              {formatMessage({ id: 'StockCount.detail', defaultMessage: '详情'})}
            </Link>
          )
        }
      }
    ]

    const modalConfig = {
      className: 'warehouse-modal',
      title: formatMessage({ id: 'StockCount.selectWarehouse', defaultMessage: '选择仓库'}),
      visible: this.state.warehouseModalVisible,
      okText: formatMessage({ id: 'StockCount.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'StockCount.cancel', defaultMessage: '取消'}),
      onOk: this.headToAddNewPO,
      onCancel: this.hideModal,
    }

    const tableConfig = {
      className: 'page-content',
      scroll: {
        x: 1100,
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
        sizeOptions: ['10'],
        onChange: this.pageChange,
      },
    }

    return (
      <div className="goods-count-list">
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

        <header className="count-list-filter-header filter-header">
          <div className="filter-select">
            <span className="range-time-title">
            {formatMessage({id: 'StockCount.inventoryTime', defaultMessage: '盘点时间'})}:
            </span>
            <RangePicker
              className="outbound-time"
              onChange={this.filterByTime}
            />
            <span className="range-time-title">
            {formatMessage({id: 'StockCount.warehouse', defaultMessage: '所属仓库'})}:
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
            <Button type="primary" onClick={this.addNewStockCount}>
            {formatMessage({id: 'StockCount.addStockCount', defaultMessage: '新建盘点'})}
            </Button>
            <Search
              placeholder={formatMessage({id: 'StockCount.verificationNoRequired', defaultMessage: '请输入盘点单号'})}
              className="search-input"
              enterButton={true}
              onSearch={this.filterByKeyword}
            />
          </div>
        </header>
        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default injectIntl(StockCount)
