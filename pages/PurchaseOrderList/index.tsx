import * as React from 'react'
import { Select, Button, Input, Radio, Table, Popconfirm, Modal, message } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { ModalProps } from 'antd/lib/modal/Modal'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Link } from 'react-router-dom'
import * as moment from 'moment'

import { axios, initTableScroll, pagesRouter, history, asyncComponent } from '@Utilities'
import './index.less'

let uuid = 1
const SendEmail = asyncComponent(() => import(
  /* webpackChunkName: "SendEmail" */'@Src/components/SendEmail'
))

const { Option } = Select
const { Search } = Input

interface PageParams {
  page?: number,
  size?: number,
  keyword?: string,
  warehouseId?: number | string,
  status?: string
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

class PurchaseOrderList extends React.Component<InjectedIntlProps & NewModalProps> {
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
    count: [],
    total: 0,
    dataSource: [],
    params: {
      page: 1,
      size: 10,
      keyword: '',
      warehouseId: 0,
      status: '',
    }
  }

  deleteOrder = (id: number) => {
    axios.delete(`/purchase/${id}`).then(res => {
      const { data } = res
      this.setState({ saveButtonLoading: false })
      if (data.code === 0) {
        message.success('采购订单删除成功')
        this.getPOList(this.state.params)
      }
    })
  }

  handleGroupChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value
    return value
    // console.log(`value is ${value}`)
  }

  componentWillMount () {
    const { intl: { locale, formatMessage } } = this.props
    axios.get('/warehouse').then(res => {
      const { data } = res.data

      const newWarehouseList = data.length > 1
        ? [{id: 0, name: formatMessage({id: 'POList.allWareHouse', defaultMessage: '全部'})}].concat(
            data.map((item: Warehouse) => ({
              ...item,
              id: item.id,
              name: locale === 'zh' ? item.cnName : item.enName
            }))
          )
        : data.map((item: Warehouse) => ({
            ...item,
            id: item.id,
            name: locale === 'zh' ? item.cnName : item.enName
          }))

      this.setState({
        warehouseList: newWarehouseList,
        warehouseId: `${data[0].id}`,
      })
    })
  }

  componentDidMount () {
    this.getPOList(this.state.params)
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)
  }

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  /**
   * 获取商品列表
   */
  getPOList = (params: PageParams) => {
    axios.get('/purchase', { params }).then(res => {
      const {
        data,
        data: {
          list: { list },
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
          status: params.status,
        },

        count: data.count.map((item: {cnt: number, status: number}) => item.cnt),

        total: data.list.total,
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

  filterByName = (keyword: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      keyword: keyword,
    }

    this.getPOList(params)
  }

  filterByStatus = (e: React.SyntheticEvent<HTMLElement>) => {
    // console.log(e)
    const params = {
      ...this.state.params,
      page: 1,
      status: (e.target as HTMLInputElement).value,
    }
    this.getPOList(params)
  }

  filterByRepo = (value: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      warehouseId: value,
    }
    this.getPOList(params)
  }

  pageChange = (page: number) => {
    const params = {
      ...this.state.params,
      page: page,
    }

    this.getPOList(params)
  }

  /**
   * add po
   */
  addNewPO = () => {
    if (this.state.warehouseList.length > 1) {
      return this.setState({ warehouseModalVisible: true })
    }

    history.push(`${pagesRouter.PurchaseOrderListCreate}?warehouseid=${this.state.warehouseId}`)
  }

  headToAddNewPO = () => {
    history.push(`${pagesRouter.PurchaseOrderListCreate}?warehouseid=${this.state.warehouseId}`)
  }

  selectWarehouse = (value: string) => {
    this.setState({ warehouseId: value })
  }

  hideModal = () => this.setState({ warehouseModalVisible: false })

  /**
   * 打开发送邮件的 modal
   */
  sendEmail = (id: number) => {
    axios.get(`/purchase/${id}/mail/loading`).then(res => {
      const { data } = res.data
      this.setState({
        mailData: data,
        sendEmailModalVisible: true,
      })
    })
  }

  /**
   * 关闭发送邮件的 modal
   */
  closeSendEmailModal = () => {
    this.setState({ sendEmailModalVisible: false })
  }

  render() {
    const {
      intl,
      intl: { formatMessage, locale }
    } = this.props

    const columns: ColumnProps<Order>[] = [
      {
        title: formatMessage({id: 'POList.code', defaultMessage: '采购单号'}),
        dataIndex: 'purchaseNo',
        fixed: 'left',
        width: 180 // 200
      },
      {
        title: formatMessage({id: 'POList.supplier', defaultMessage: '供应商名称'}),
        dataIndex: 'supplierName',
        width: 120
      },
      {
        title: formatMessage({id: 'POList.amount', defaultMessage: '采购总数'}),
        dataIndex: 'totalQty',
        width: 100
      },
      {
        title: formatMessage({id: 'POList.count', defaultMessage: '采购总额'}),
        dataIndex: 'totalAmount',
        // render: (text, record, index) => <b>${record.count}</b>,
        width: 100
      },
      {
        title: formatMessage({id: 'POList.createTime', defaultMessage: '创建时间'}),
        // todo: 日期进行格式化
        // key: 'createTime',
        dataIndex: 'createTime',
        width: 200
      },
      {
        title: formatMessage({id: 'POList.respository', defaultMessage: '所属仓库'}),
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
        title: formatMessage({id: 'POList.status', defaultMessage: '状态'}),
        key: 'status',
        render: (text, record, index) => {
          let statusInfo
          switch (record.status) {
            case 2:
              statusInfo = {type: 'defualt', info: formatMessage({id: 'POList.allIn', defaultMessage: '全部入库'})}
              break
            case 1:
              statusInfo = {type: 'primary', info: formatMessage({id: 'POList.partIn', defaultMessage: '部分入库'})}
              break
            default:
              statusInfo = {type: 'warn', info: formatMessage({id: 'POList.waitIn', defaultMessage: '待入库'})}
          }
          return <div className={`status-${statusInfo.type}`}>{statusInfo.info}</div>
        },
        width: 150
      },
      {
        title: formatMessage({id: 'POList.operation', defaultMessage: '操作'}),
        // title: formatMessage({id: 'operation', defaultMessage: 'eeee我'}),
        key: 'operation',
        // fixed: 'right',
        width: 150,
        render: (text, record, index) => {
          // 未入库订单
          if (record.status === 0) {
            return <>
              <div>
                <Link
                  to={`${pagesRouter.PurchaseOrderListView}?warehouseid=${record.warehouseId}&poid=${record.id}`}
                >
                  {formatMessage({id: 'POList.view'})}
                </Link>
              </div>
              <div>
                <Link to={`${pagesRouter.PurchaseOrderListEdit}?warehouseid=${record.warehouseId}&poid=${record.id}`}>
                  {formatMessage({id: 'POList.edit'})}
                </Link>
              </div>
              <div>
                <Popconfirm
                  title={formatMessage({id: 'POList.confirm', defaultMessage: '确定要删除？'})}
                  okText={formatMessage({id: 'POList.yes', defaultMessage: '确定'})}
                  cancelText={formatMessage({id: 'POList.no', defaultMessage: '取消'})}
                  onConfirm={this.deleteOrder.bind(this, record.id)}
                >
                  <a href="#">{formatMessage({id: 'POList.delete', defaultMessage: '删除'})}</a>
                </Popconfirm>
              </div>
              <div onClick={this.sendEmail.bind(this, record.id)}>
                <a>{formatMessage({id: 'POList.sendEmail', defaultMessage: '发送邮件'})}</a>
              </div>
              <div>
                <Link
                  to={`${pagesRouter.PurchaseOrderListInStorage}?warehouseid=${record.warehouseId}&poid=${record.id}`}
                >
                  {formatMessage({id: 'POList.inStorage', defaultMessage: '入库'})}
                </Link>
              </div>
            </>
          }

          // 部分入库订单
          if (record.status === 1) {
            return [
              (
                <div key={`${record.id}view`}>
                  <Link
                    to={`${pagesRouter.PurchaseOrderListView}?warehouseid=${record.warehouseId}&poid=${record.id}`}
                  >
                    {formatMessage({id: 'POList.view'})}
                  </Link>
                </div>
              ),
              (
                <div key={`${record.id}inStorage`}>
                  <Link
                    key={`${record.id}view`}
                    to={`${pagesRouter.PurchaseOrderListInStorage}?warehouseid=${record.warehouseId}&poid=${record.id}`}
                  >
                  {formatMessage({id: 'POList.inStorage', defaultMessage: '入库'})}
                  </Link>
                </div>
              )
            ]
          }

          // 全部入库订单
          if (record.status === 2) {
            return (
              <Link
                key={`${record.id}view`}
                to={`${pagesRouter.PurchaseOrderListView}?warehouseid=${record.warehouseId}&poid=${record.id}`}
              >
                {formatMessage({id: 'POList.view'})}
              </Link>
            )
          }

          return null
        }
      }
    ]

    const modalConfig = {
      className: 'warehouse-modal',
      title: '选择仓库',
      visible: this.state.warehouseModalVisible,
      okText: formatMessage({ id: 'AddSupplierModal.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'AddSupplierModal.cancel', defaultMessage: '取消'}),
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

    const sendEmailConfig = {
      className: 'send-email-modal',
      // POId: this.state.POId,
      mailData: this.state.mailData,
      intl: intl,
      visible: this.state.sendEmailModalVisible,
      closeSendEmailModal: this.closeSendEmailModal,
    }

    // console.log(this.state.warehouseId)
    const { count } = this.state
    return (
      <div className="purchase-list" id="purchase-list">
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

        {this.state.sendEmailModalVisible &&
          <SendEmail key={`email${uuid++}`} {...sendEmailConfig}/>
        }

        <header className="po-list-filter-header filter-header">
          <Radio.Group
            defaultValue={''}
            onChange={this.filterByStatus}
          >
            <Radio.Button value={''}>
            {formatMessage({id: 'POList.all', defaultMessage: '全部'})}
            </Radio.Button>
            <Radio.Button value={'0'}>
            {`${formatMessage({id: 'POList.waitIn', defaultMessage: '待入库'})} ( ${count[0] ? count[0] : 0} )`}
            </Radio.Button>
            <Radio.Button value={'1'}>
            {`${formatMessage({id: 'POList.partIn', defaultMessage: '部分入库'})} ( ${count[0] ? count[1] : 0} )`}
            </Radio.Button>
            <Radio.Button value={'2'}>
            {`${formatMessage({id: 'POList.allIn', defaultMessage: '全部入库'})} ( ${count[0] ? count[2] : 0} )`}
            </Radio.Button>
          </Radio.Group>
          <div className="filter-input">
            <Button type="primary" onClick={this.addNewPO}>
            {formatMessage({id: 'POList.addPO', defaultMessage: '新增采购订单'})}
            </Button>
            <Select
              className="respo-select"
              style={{width: locale === 'zh' ? 100 : 160 }}
              defaultValue={this.state.warehouseList[0].name}
              onChange={this.filterByRepo}
            >
              {this.state.warehouseList.map(item =>
                <Option key={`${item.id}warehouse`} value={item.id}>{item.name}</Option>
              )}
            </Select>
            <Search
              placeholder={formatMessage({id: 'POList.keyword', defaultMessage: '请输入搜索内容'})}
              className="search-input"
              enterButton={true}
              onSearch={this.filterByName}
            />
          </div>
        </header>
        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default injectIntl(PurchaseOrderList)
