import * as React from 'react'
import { Table, Button, Input, message, Modal, Select } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { ModalProps } from 'antd/lib/modal/Modal'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, initTableScroll, asyncComponent } from '@Utilities'
import './index.less'

const AddSupplierModal = asyncComponent(() => import(
  /* webpackChunkName: "AddSupplierModal" */'@Components/AddSupplierModal'
))

// let uuid = 1
const { Option } = Select

interface PageParams {
  page?: number,
  size?: number,
  keyword?: string,
}

interface ListsUser {
  key?: number
  id?: number
  name?: string
  email: string | undefined
  contactName?: string
  shortName?: string
  tel?: number
  position?: number
  remark?: string
  loading?: boolean
  pagination?: boolean
}

interface SupplierInfo {
  name?: string
  shortName?: string
  address?: string
  contactLists?: ListsUser[]
  remark?: string
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

const { Search } = Input

class PurchaseSuppliers extends React.Component<ListsUser & InjectedIntlProps & NewModalProps> {
  state = {
    loading: false,
    // supplier lists
    total: 1,
    dataSource: [],

    page: 1,
    size: 10,
    keyword: '',

    // add supplier modal
    status: 'create',
    supplierId: -1,
    modalVisible: false,
    confirmButtonLoading: false,

    warehouseModalVisible: false,
    warehouseList: [
      {
        id: '0',
        name: this.props.intl.formatMessage({id: 'POList.allWareHouse', defaultMessage: '全部'})
      }
    ],
    warehouseId: '0',
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
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)

    this.refreshList()
  }

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  // 卸载方法
  componentWillUnmount () {
    removeEventListener('resize', initTableScroll)
  }

  /**
   * 获取商品列表
   */
  getPurchaseSuppliers = (params: PageParams) => {
    axios.get('/supplier/list', { params }).then(res => {
      const {
        data,
        data: {
          list,
        },
      } = res.data

      this.setState({
        page: params.page,
        size: params.size,
        keyword: params.keyword,

        total: data.total,
        originData: data,
        dataSource: list.map((item: ListsUser) => (
          { ...item,
            key: item.id,
          }
        )),
      })
    })
  }

  filterByName = (keyword: string) => {
    const params = {
      page: 1,
      size: this.state.size,
      keyword: keyword,
    }

    this.getPurchaseSuppliers(params)
  }

  pageChange = (page: number) => {
    const params = {
      page: page,
      size: this.state.size,
      keyword: this.state.keyword,
    }

    this.getPurchaseSuppliers(params)
  }

  refreshList = () => {
    const params: PageParams = {
      page: this.state.page,
      size: this.state.size,
      keyword: this.state.keyword,
    }
    this.getPurchaseSuppliers(params)
  }

  /**
   * show modal
   */
  showModal = (status: string, supplierId: number) => {
    if (this.state.warehouseList.length > 1 && status === 'create') {
      return this.setState({
        status: status,
        supplierId: supplierId,
        warehouseModalVisible: true,
      })
    }

    this.setState({
      status: status,
      supplierId: supplierId,
      modalVisible: true,
    })
  }

  // close modal
  closeSupllierModal = () => {
    this.setState({ modalVisible: false })
  }

  selectWarehouse = (value: string) => {
    this.setState({ warehouseId: value })
  }

  addNewSupplier = () => {
    this.setState({
      warehouseModalVisible: false,
      modalVisible: true,
    })
  }

  hideWarehouseModal = () => this.setState({ warehouseModalVisible: false })

  createOrEditSupplier = (supplierParams: SupplierInfo, id: number) => {
    const {
      intl: { formatMessage }
    } = this.props

    this.setState({ confirmButtonLoading: true })

    if (id === -1) {
      // add supplier
      axios.post(`supplier/${this.state.warehouseId}`, supplierParams)
        .then(res => {
          if (res.data.ok) {
            this.setState({
              modalVisible: false,
              warehouseModalVisible: false,
              confirmButtonLoading: false,
            })
            message.success(formatMessage({
              id: 'PurchaseSuppliers.createSuccess',
              defaultMessage: '创建供应商成功'
            }))

            // 刷新列表
            this.refreshList()
          }
        })
        .catch(() => { this.setState({ confirmButtonLoading: false }) })
    } else {
      // edit supplier
      axios.put(`supplier/${id}`, supplierParams)
        .then(res => {
          if (res.data.ok) {
            this.setState({
              modalVisible: false,
              confirmButtonLoading: false,
            })
            message.success(formatMessage({
              id: 'PurchaseSuppliers.EditSuccess',
              defaultMessage: '编辑供应商成功'
            }))

            // 刷新列表
            this.refreshList()
          }
        })
        .catch(() => { this.setState({ confirmButtonLoading: false }) })
    }
  }

  render() {
    const {
      intl,
      intl: { formatMessage },
    } = this.props

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'PurchaseSuppliers.name', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 200,
        fixed: 'left',
        className: 'name',
      },
      {
        key: 'shortName',
        title: formatMessage({ id: 'PurchaseSuppliers.shortName', defaultMessage: '标签'}),
        dataIndex: 'shortName',
        width: 150,
      },
      {
        key: 'contactName',
        title: formatMessage({ id: 'PurchaseSuppliers.contactName', defaultMessage: '建建议零售价'}),
        dataIndex: 'contactName',
        width: 150,
      },
      {
        key: 'position',
        title: formatMessage({ id: 'PurchaseSuppliers.POSITION', defaultMessage: '创建时间'}),
        dataIndex: 'position',
        width: 160,
      },
      {
        key: 'email',
        title: formatMessage({ id: 'PurchaseSuppliers.Email', defaultMessage: '创建时间'}),
        dataIndex: 'email',
        width: 240,
      },
      {
        key: 'operation',
        title: formatMessage({ id: 'PurchaseSuppliers.operation', defaultMessage: '操作'}),
        dataIndex: 'operation',
        width: 100,
        className: 'operation',
        // fixed: 'right',
        render: (ops, supplier) =>
          (
            <a key={`${supplier.id}edit`} onClick={this.showModal.bind(this, 'edit', supplier.id)}>
            {formatMessage({ id: 'PurchaseSuppliers.edit', defaultMessage: '编辑' })}
            </a>
          )
      },
    ]

    const data: ListsUser[] = this.state.dataSource

    const tableConfig = {
      scroll: {
        x: 1000,
        y: 1
      },
      loading: this.state.loading,
      columns: columns,
      dataSource: data,
      pagination: {
        defaultCurrent: 1,
        total: this.state.total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10'],
        onChange: this.pageChange,
      },
    }

    const selectWarehouseModalConfig = {
      className: 'warehouse-modal',
      title: '选择仓库',
      visible: this.state.warehouseModalVisible,
      okText: formatMessage({ id: 'AddSupplierModal.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'AddSupplierModal.cancel', defaultMessage: '取消'}),
      onOk: this.addNewSupplier,
      onCancel: this.hideWarehouseModal,
    }

    const modalConfig = {
      intl,
      closeSupllierModal: this.closeSupllierModal,
      createOrEditSupplier: this.createOrEditSupplier,
      status: this.state.status,
      warehouseId: this.state.warehouseId,
      supplierId: this.state.supplierId,
      visible: this.state.modalVisible,
      confirmLoading: this.state.confirmButtonLoading,
    }

    return (
      <div className="purchase-supplier-lists">
        <Modal {...selectWarehouseModalConfig}>
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

        <AddSupplierModal key={`${this.state.supplierId}${this.state.modalVisible}`} {...modalConfig}/>

        <header className="filter-header ">
          <Search
            style={{ width: 300 }}
            placeholder={formatMessage({ id: 'PurchaseSuppliers.searchPlaceholder', defaultMessage: '请输入搜索内容'})}
            enterButton={true}
            onSearch={this.filterByName}
          />
          <Button type="primary" onClick={this.showModal.bind(this, 'create', -1)}>
            {formatMessage({ id: 'PurchaseSuppliers.createSupplier', defaultMessage: '新增供应商'})}
          </Button>
        </header>

        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default injectIntl(PurchaseSuppliers)
