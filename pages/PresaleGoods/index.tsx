import * as React from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Input, Radio, Modal, Select } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, getPicSrc, initTableScroll, pagesRouter, history } from '@Utilities'
import './index.less'

interface PageParams {
  page?: number,
  size?: number,
  keyword?: string,
  tagId?: number,
}

interface Warehouse {
  id?: number | string
  name?: string
  cnName?: string
  enName?: string
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
  price: number
  tags: string
  loading?: boolean
  pagination?: boolean
}

const { Search } = Input
const { Option } = Select

class GoodsList extends React.Component<ListsUser & InjectedIntlProps> {
  state = {
    loading: false,
    total: 1,
    dataSource: [],

    params: {
      page: 1,
      size: 10,
      keyword: '',
      tagId: 0,
    },

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

    this.getGoodsList(this.state.params)
  }

  // tslint:disable-next-line
  componentWillReceiveProps (next: any) {
    /**
     * 如果 this.props.tags 为 undefined，更新 tags list
     */
    if (!this.props.tags) {
      this.setState({ tags: next.tags })
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

  /**
   * 获取商品列表
   */
  getGoodsList = (params: PageParams) => {
    axios.get('/product', { params }).then(res => {
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
          tagId: params.tagId,
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

  filterByName = (keyword: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      keyword: keyword,
    }

    this.getGoodsList(params)
  }

  pageChange = (page: number) => {
    const params = {
      ...this.state.params,
      page: page,
    }

    this.getGoodsList(params)
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

  render() {
    const {
      intl: { locale, formatMessage },
    } = this.props

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'GoodsList.goods', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 300,
        className: 'name',
        // fixed: 'left',
        render: (name, goods) => <>
          <img src={getPicSrc((goods.mainPic).split('|')[0])} alt=""/>
          <span>{name}</span>
        </>
      },
      {
        key: 'price',
        title: '可销售数量',
        dataIndex: 'price',
        width: 150,
      },
      {
        key: 'saleNumber',
        title: '已销售数量',
        dataIndex: 'price',
        width: 150,
      },
      {
        key: 'status',
        title: '预售状态',
        dataIndex: 'price',
        width: 200,
        render: () => <span className="status-warn">未开始</span>,
      },
      {
        key: 'warehouseId',
        title: '所属仓库',
        dataIndex: 'price',
        width: 200,
      },
      {
        key: 'remark',
        title: '备注',
        dataIndex: 'createTime',
        width: 200,
      },
      {
        key: 'operation',
        title: formatMessage({ id: 'GoodsList.operation', defaultMessage: '操作'}),
        dataIndex: 'operation',
        width: 150,
        // fixed: 'right',
        className: 'operation',
        render: (ops, goods) => <>
          <Link to={`${pagesRouter.GoodsListEdit}?id=${goods.id}`}>
          {formatMessage({ id: 'GoodsList.edit', defaultMessage: '编辑' })}
          </Link>
          <a>删除</a>
        </>
      },
    ]

    const data: ListsUser[] = this.state.dataSource

    const tableConfig = {
      scroll: {
        x: 1350,
        y: 1,
      },
      loading: this.state.loading,
      columns: columns,
      dataSource: data,
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

    const modalConfig = {
      className: 'warehouse-modal',
      title: '选择仓库',
      visible: this.state.warehouseModalVisible,
      okText: formatMessage({ id: 'AddSupplierModal.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'AddSupplierModal.cancel', defaultMessage: '取消'}),
      onOk: this.headToAddNewPO,
      onCancel: this.hideModal,
    }

    return (
      <div className="presale-goods">
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

        <header className="presale-goods-filter-header filter-header">
          <Radio.Group
            defaultValue={''}
            // onChange={this.filterByStatus}
          >
            <Radio.Button value={''}>
            全部
            </Radio.Button>
            <Radio.Button value={'0'}>
            未开始 ( 10 )
            </Radio.Button>
            <Radio.Button value={'1'}>
            预售中 ( 8 )
            </Radio.Button>
            <Radio.Button value={'2'}>
            已结束 ( 2 )
            </Radio.Button>
          </Radio.Group>
          <div className="filter-input">
            <Button type="primary" className="create-button" onClick={this.addNewPO}>
              创建预售商品
            </Button>
            <Select
              className="respo-select"
              style={{width: locale === 'zh' ? 100 : 160 }}
              defaultValue={this.state.warehouseList[0].name}
              // onChange={this.filterByRepo}
            >
              {this.state.warehouseList.map(item =>
                <Option key={`${item.id}warehouse`} value={item.id}>{item.name}</Option>
              )}
            </Select>
            <Search
              style={{ width: 256 }}
              className="search-input"
              placeholder={formatMessage({ id: 'GoodsList.searchPlaceholder', defaultMessage: '请输入搜索内容'})}
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

export default injectIntl(GoodsList)
