import * as React from 'react'
import { Link } from 'react-router-dom'
import { DispatchProp } from 'react-redux'
import { Tag, Table, Input, Select } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, adminAxios, getPicSrc, initTableScroll, pagesRouter } from '@Utilities'
import './index.less'

declare type Func = () => {}

interface Warehouse {
  id?: number | string
  name?: string
  cnName?: string
  enName?: string
}

interface PageParams {
  page?: number,
  size?: number,
  tagId?: number | string,
  keyword?: string
}

interface ListsUser {
  height?: number
  key: number
  id?: number
  sort?: number
  name: string
  cnName?: string
  enName?: string
  createTime: number
  onShelfTime?: number
  hasSku: boolean
  mainPic: string
  price: number
  tags: string
  tagNames?: string
  loading?: boolean
  pagination?: boolean
}

const { Search } = Input
const { Option } = Select

class GoodsList extends React.Component<ListsUser & InjectedIntlProps & DispatchProp<Func>> {
  state = {
    loading: false,
    total: 1,
    dataSource: [],

    params: {
      page: 0,
      size: 10,
      keyword: '',
      tagId: 0,
    },

    tags: [{id: 0, name: '全部标签', checked: false}],

    tagsList: [
      {
        id: 0,
        name: '全部',
      }
    ],

    warehouseList: [
      {
        id: '-1',
        name: '全部',
      }
    ],
    warehouseId: '-1',
  }

  componentDidMount () {
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)

    this.getWareHouseAndTagsList()
    // this.getWareHouseList()
    // this.getGoodsList(this.state.params)
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
   * get WarehouseL list
   */
  getWareHouseAndTagsList = () => {
    const { intl: { locale, formatMessage } } = this.props

    Promise.all([
      axios.get('/warehouse'),
      adminAxios.get('/productTag?page=0&size=100'),
    ]).then(([warehouseRes, tagRes]) => {
      const { data } = warehouseRes.data
      const { data: { content } } = tagRes.data

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

      const newTagsList = content.length > 1
        ? [{id: 0, name: '全部'}].concat(
            content.map((item: Warehouse) => ({
              ...item,
              name: item.name
            }))
          )
        : content.map((item: Warehouse) => ({
            ...item,
            name: item.name
          }))

      this.setState({
        tagsList: newTagsList,
        warehouseList: newWarehouseList,
        warehouseId: `${data[0].id}`,
      }, () => {this.getGoodsList(this.state.params)})
    })
  }

  /**
   * 获取商品列表
   */
  getGoodsList = (params: PageParams) => {
    // this.setState({ loading: true })
    adminAxios.get('/mall/product/waitShelf', { params }).then(res => {
      const {
        data,
        data: {
          content: list,
        },
      } = res.data

      const {
        intl: { locale }
      } = this.props

      this.setState({
        // loading: false,
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword,
          tagId: params.tagId,
        },

        total: data.totalElements,
        originData: data,
        dataSource: list.map((item: ListsUser) => ({
            ...item,
            cnName: item.name,
            enName: item.name,
          }))
          .map((item: ListsUser) => (
            { ...item,
              name: locale === 'zh' ? item.cnName : item.enName,
              key: item.id,
              tags: item.tagNames,
              onShelfTime: moment(item.onShelfTime).format('YYYY-MM-DD HH:mm:ss')
            }
          )),
      })
    })
  }

  filterByName = (keyword: string) => {
    const params = {
      ...this.state.params,
      page: 0,
      keyword: keyword,
    }

    this.getGoodsList(params)
  }

  pageChange = (page: number) => {
    const params = {
      ...this.state.params,
      page: page - 1,
    }

    this.getGoodsList(params)
  }

  filterByTags = (tagId: string) => {
    const params = {
      ...this.state.params,
      page: 0,
      tagId: Number(tagId),
    }

    this.getGoodsList(params)
  }

  render() {
    const {
      intl: { locale, formatMessage },
    } = this.props

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        // title: formatMessage({ id: 'GoodsList.goods', defaultMessage: '商品'}),
        title: '商品',
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
        // title: formatMessage({ id: 'GoodsList.goods', defaultMessage: '售价（元）'}),
        title: '售价（元）',
        dataIndex: 'price',
        width: 120,
        className: 'price',
      },
      {
        key: 'inventory',
        // title: formatMessage({ id: 'GoodsList.goods', defaultMessage: '售价（元）'}),
        title: '可销售库存',
        dataIndex: 'inventory',
        width: 120,
        className: 'inventory',
      },
      {
        key: 'tags',
        // title: formatMessage({ id: 'GoodsList.tags', defaultMessage: '标签'}),
        title: '标签',
        dataIndex: 'tags',
        width: 200,
        render: (tags) => tags !== undefined &&
          tags.split(',').map((item: string) => <Tag key={`tags${item}`}>{item}</Tag>)
      },
      {
        key: 'onShelfTime',
        // title: formatMessage({ id: 'GoodsList.createTime', defaultMessage: '创建时间'}),
        title: '上架时间',
        dataIndex: 'onShelfTime',
        width: 200,
      },
      {
        key: 'operation',
        // title: formatMessage({ id: 'GoodsList.operation', defaultMessage: '操作'}),
        title: '操作',
        dataIndex: 'operation',
        width: 150,
        // fixed: 'right',
        className: 'operation',
        render: (ops, goods) => <>
          <Link to={`${pagesRouter.GoodsListView}?id=${goods.id}`}>
          {formatMessage({ id: 'GoodsList.view', defaultMessage: '查看' })}
          </Link>
          <Link to={`${pagesRouter.WaitingForGoodsDetailsEdit}?id=${goods.id}`}>
          上架
          </Link>
        </>
      },
    ]

    const data: ListsUser[] = this.state.dataSource

    const tableConfig = {
      scroll: {
        x: 1090,
        y: 1,
      },
      loading: this.state.loading,
      columns: columns,
      dataSource: data,
      pagination: {
        defaultCurrent: 1,
        current: this.state.params.page + 1,
        total: this.state.total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10'],
        onChange: this.pageChange,
      },
    }

    const TagsFilter = <div className="filter-select">
      <span className="tags-title">标签:</span>
      <Select
        className="tags-select select"
        style={{width: locale === 'zh' ? 100 : 160 }}
        defaultValue={String(this.state.params.tagId)}
        onChange={this.filterByTags}
      >
        {this.state.tagsList.map(item =>
          <Option key={`${item.id}tags`} value={String(item.id)}>{item.name}</Option>
        )}
      </Select>

      <span className="tags-title">所属仓库:</span>
      <Select
        className="tags-select select"
        style={{width: locale === 'zh' ? 100 : 160 }}
        defaultValue={this.state.warehouseId}
        // onChange={this.filterByRepo}
      >
        {this.state.warehouseList.map(item =>
          <Option key={`${item.id}tags`} value={item.id}>{item.name}</Option>
        )}
      </Select>
    </div>

    const NameFilter = <div className="filter-input">
      {/* <Button type="primary" className="create-button">
        <Link to={pagesRouter.GoodsListCreate}>商品排序</Link>
      </Button> */}
      <Search
        style={{ width: 256 }}
        placeholder={formatMessage({ id: 'GoodsList.searchPlaceholder', defaultMessage: '请输入搜索内容'})}
        enterButton={true}
        onSearch={this.filterByName}
      />
    </div>

    const FilterHeader = <header className="mall-goods-filter-header filter-header">
      {TagsFilter}
      {NameFilter}
    </header>

    return (
      <div className="mall-goods-wait-shelves">
        {FilterHeader}
        <Table {...tableConfig}/>
      </div>
    )
  }
}

export default injectIntl(GoodsList)
