import * as React from 'react'
import { Link } from 'react-router-dom'
import { connect, DispatchProp } from 'react-redux'
import { Tag, Table, Button, Input } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, getPicSrc, initTableScroll, pagesRouter } from '@Utilities'
import { getProductDropData } from '@Redux/actions/commonAction'
import './index.less'

declare type Func = () => {}

interface TagsProps {
  id: number
  name: string
  checked: boolean
}

interface PageParams {
  page?: number,
  size?: number,
  keyword?: string,
  tagId?: number,
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

const { CheckableTag } = Tag
const { Search } = Input

class GoodsList extends React.Component<ListsUser & InjectedIntlProps & DispatchProp<Func>> {
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

    tags: [{id: 0, name: '全部标签', checked: false}],
  }

  componentWillMount () {
    const { dispatch } = this.props
    // if (pathname !== '/login') {
      // tslint:disable-next-line
    dispatch && dispatch(getProductDropData())
    // }
  }

  componentDidMount () {
    const newTags = Array.isArray(this.props.tags)
      ? this.state.tags.concat(
        this.props.tags.map(item => ({...item, checked: false}))
      )
      : this.state.tags
    this.setState({ tags: newTags })

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
   * change tags
   * 如果当前被选择的标签数量是 0，激活被选中的标签
   * 如果当前被选择的标签数量是 1，重置所有标签，激活被选择的标签
   * 重复点击当前被激活的 tag，置灰该标签
   */
  changeTags = (id: number, checked: boolean) => {
    const { tags } = this.state
    const activeTags = tags.filter(item => item.checked)
    let newTags

    // 如果当前被选择的标签数量是 0，激活被选中的标签
    if (activeTags.length === 0) {
      newTags = tags.map((item: TagsProps) => {
        if (item.id === id) { return {...item, checked: !item.checked }}
        return item
      })
    // 重复点击当前被激活的 tag，置灰该标签
    } else if (activeTags.length > 0 && activeTags[0].id === id) {
      newTags = tags.map((item: TagsProps) => ({...item, checked: false}))
    // 如果当前被选择的标签数量是 1，重置所有标签，激活被选择的标签
    } else {
      newTags = tags
        .map((item: TagsProps) => ({...item, checked: false}))
        .map((item: TagsProps) => {
        if (item.id === id) { return {...item, checked: !item.checked }}
        return item
      })
    }

    // 根据被选中 tagId，删选当前商品列表
    const tagIdArray = newTags.filter(item => item.checked)
    if (tagIdArray.length > 0 ) {
      const params = {
        ...this.state.params,
        tagId: tagIdArray[0].id,
      }
      this.getGoodsList(params)
    // 重置标签，重新请求数据
    } else {
      const params = {
        ...this.state.params,
        tagId: 0,
      }
      this.getGoodsList(params)
    }

    this.setState({ tags: newTags })
  }

  render() {
    const {
      intl: { formatMessage },
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
        key: 'tags',
        title: formatMessage({ id: 'GoodsList.tags', defaultMessage: '标签'}),
        dataIndex: 'tags',
        width: 300,
        render: (tags) => tags !== undefined &&
          tags.split(',').map((item: string) => <Tag key={`tags${item}`}>{item}</Tag>)
      },
      {
        key: 'price',
        title: formatMessage({ id: 'GoodsList.price', defaultMessage: '建建议零售价'}),
        dataIndex: 'price',
        width: 120,
      },
      {
        key: 'createTime',
        title: formatMessage({ id: 'GoodsList.createTime', defaultMessage: '创建时间'}),
        dataIndex: 'createTime',
        width: 180,
      },
      {
        key: 'operation',
        title: formatMessage({ id: 'GoodsList.operation', defaultMessage: '操作'}),
        dataIndex: 'operation',
        width: 150,
        // fixed: 'right',
        className: 'operation',
        render: (ops, goods) => <>
          <Link to={`${pagesRouter.GoodsListView}?id=${goods.id}`}>
          {formatMessage({ id: 'GoodsList.view', defaultMessage: '查看' })}
          </Link>
          <Link to={`${pagesRouter.GoodsListEdit}?id=${goods.id}`}>
          {formatMessage({ id: 'GoodsList.edit', defaultMessage: '编辑' })}
          </Link>
        </>
      },
    ]

    const data: ListsUser[] = this.state.dataSource

    const tableConfig = {
      scroll: {
        x: 1050,
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

    return (
      <div className="goods-lists">
        <header className="goods-list-filter-header filter-header">
          <div className="filter-tag">
            <span>{formatMessage({ id: 'GoodsList.filterTags', defaultMessage: '筛选标签'})}：</span>
            {this.state.tags.map((item: TagsProps) =>
              <CheckableTag key={item.id} checked={item.checked} onChange={this.changeTags.bind(this, item.id)}>
              {item.name}
              </CheckableTag>
            )}
          </div>
          <div className="filter-input">
            <Button type="primary" className="create-button">
              <Link to={pagesRouter.GoodsListCreate}>
              {formatMessage({ id: 'GoodsList.createGoods', defaultMessage: '创建商品'})}
              </Link>
            </Button>
            <Search
              style={{ width: 256 }}
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

// tslint:disable-next-line
const mapStateToProps = (state: any) => {
  const {
    productDrops: { tags }
  } = state.common
  return {tags: tags}
}

export default injectIntl(connect(mapStateToProps)(GoodsList))
