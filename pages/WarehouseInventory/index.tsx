import * as React from 'react'
import { Table, Input, Select } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, getPicSrc, initTableScroll } from '@Utilities'
import './index.less'

interface Product {
  id: number,
  enName: string,
  cnName: string,
  inventory: number,
  mainPic: string,
  skuName?: string,
  warehouseId: number
}

interface Warehouse {
  id: number,
  cnName: string,
  enName: string
}

const { Option } = Select
const { Search } = Input
class WarehouseInventory extends React.Component<InjectedIntlProps> {
  state = {
    loading: true,
    dataSource: [],
    total: 0,
    warehouseList: [],
    warehouseData: {}, // id 为 key
    params: {
      page: 1,
      size: 10,
      keyword: '',
      warehouseId: 0
    }
  }

  componentDidMount () {
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)

    axios.get('/warehouse').then(({data}) => {
      const warehouseList = data.data
      const warehouseData = (warehouseList as Array<Warehouse>).reduce(
        (value, {id, cnName, enName}) => {
          value[id] = {
            cnName,
            enName
          }
          return value
        },
        {}
      )
      this.setState({
        warehouseList,
        warehouseData
      })
    })
    this.getData(this.state.params)
  }

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  // 卸载方法
  componentWillUnmount () {
    removeEventListener('resize', initTableScroll)
  }

  // tslint:disable-next-line
  getData = (params: any) => {
    const {
      intl: { locale }
    } = this.props
    // const { params } = this.state
    axios.get('/inventory', { params }).then(res => {
      const { list, total } = res.data.data

      this.setState({
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword,
          warehouseId: params.warehouseId,
        },
        loading: false,
        // tslint:disable-next-line
        dataSource: list.map((item: any, index: number) => (
          { ...item,
            name: locale === 'zh' ? item.cnName : item.enName,
            key: `${item.id}${index}`,
          }
        )),
        total
      })
    })
  }

  handleKeywordChange = (keyword: string) => {
    keyword = keyword.trim()

    const params = {
      ...this.state.params,
      page: 1,
      keyword
    }

    this.getData(params)
  }

  handleWareHouseChange = (warehouseId: string) => {
    const params = {
      ...this.state.params,
      page: 1,
      warehouseId: warehouseId === 'all' ? 0 : warehouseId
    }

    this.getData(params)
  }

  handlePageChange = (page: number) => {
    const params = {
      ...this.state.params,
      page
    }

    this.getData(params)
  }

  // handleSizeChange = (current: number, size: number) => {
  //   this.setState(
  //     {
  //       params: {
  //         ...this.state.params,
  //         page: 1, // 每次改变 pagesize，都变成第一页
  //         size
  //       },
  //       loading: true
  //     },
  //     this.getData
  //   )
  // }

  render () {
    const {
      intl: { formatMessage, locale }
    } = this.props
    const { warehouseData, warehouseList } = this.state
    const columns: ColumnProps<Product>[] = [
      {
        title: formatMessage({id: 'WarehouseInventory.product', defaultMessage: '商品'}),
        key: 'purchaseNo',
        fixed: 'left',
        width: 300,
        render: (text, record, index) => (
          <div className="product-info">
            <img src={getPicSrc(record.mainPic)} alt="beer-pic"/>
            <p>{record.cnName}</p>
          </div>
        )
      },
      {
        title: formatMessage({id: 'WarehouseInventory.skuInfo', defaultMessage: '商品规格'}),
        key: 'skuName',
        width: 160,
        render: (text, record, index) => record.skuName ?
          record.skuName :
          formatMessage({id: 'WarehouseInventory.noSku', defaultMessage: '无规格'})
      },
      {
        title: formatMessage({id: 'WarehouseInventory.skuCode', defaultMessage: 'SKU编码'}),
        key: 'barCode',
        dataIndex: 'barCode',
        width: 240
      },
      {
        title: formatMessage({id: 'WarehouseInventory.warehouse', defaultMessage: '所属仓库'}),
        key: 'warehouse',
        width: 120,
        render: (text, record, index) => {
          const warehouse = warehouseData[record.warehouseId]
          return locale === 'en' ? warehouse.enName : warehouse.cnName
        }
      },
      {
        title: formatMessage({id: 'WarehouseInventory.inventory', defaultMessage: '库存总量'}),
        key: 'inventory',
        dataIndex: 'inventory',
        width: 120,
      }
    ]

    const tableConfig = {
      scroll: {
        x: 940,
        y: 1,
      },
      className: 'page-content',
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
        onChange: this.handlePageChange,
      }
    }

    return (
      <div className="inventory">
        <header className="filter-header">
          <Search
            className="search-input"
            placeholder={formatMessage({id: 'WarehouseInventory.keyword', defaultMessage: '搜索商品名称/SKU编码'})}
            enterButton={true}
            onSearch={this.handleKeywordChange}
          />
          <span className="select-label">
            {formatMessage({id: 'WarehouseInventory.warehouse', defaultMessage: '所属仓库'})}:
          </span>
          <Select
            className="warehouse-select"
            defaultValue="all"
            onChange={this.handleWareHouseChange}
          >
            <Option value="all">
              {formatMessage({id: 'WarehouseInventory.defaultWarehouse', defaultMessage: '全部仓库'})}
            </Option>
            {(warehouseList as Array<Warehouse>).map(({id, cnName, enName}) =>
                <Option key={id} value={id}>{locale === 'en' ? enName : cnName}</Option>
            )}
          </Select>
        </header>
        <Table {...tableConfig} />
      </div>
    )
  }
}

export default injectIntl(WarehouseInventory)
