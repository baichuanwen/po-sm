import * as React from 'react'
// import { Link } from 'react-router-dom'
import { Modal, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { ModalProps } from 'antd/lib/modal/Modal'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, getPicSrc } from '@Utilities'
import './index.less'

interface PageParams {
  page: number,
  size?: number,
  keyword?: string,
}

interface ListsUser {
  key: number
  skuId?: number
  id: number
  name: string
  cnName?: string
  enName?: string
  mainPic: string
  loading?: boolean
  price: number | string
  quantity: number | string | undefined
  weight: number
  page?: number
  pagination?: boolean
}

interface NewModalProps extends ModalProps {
  status: string
  totalData?: ListsUser[]
  temGoods?: ListsUser[]
  warehouse?: string
  warehouseId?: number | string
  selectedGoods?: ListsUser[]
  closeGoodsModal: () => {}
  updateSelectGoodsKeys: (rowKeys: ListsUser[]) => {}
}

const { Search } = Input

class AddGoods extends React.Component<NewModalProps & InjectedIntlProps> {
  state = {
    loading: false,
    total: 0,
    dataSource: [],
    totalData: [
      {
        id: -1,
        name: '',
      }
    ],

    params: {
      page: 1,
      size: 10,
      keyword: '',
    },

    temGoods: [],
  }

  componentWillMount () {
    // console.log(this.props.selectedGoods.map((item: ListsUser) => item.page))
    this.setState({
      totalData: this.props.selectedGoods,
      temGoods: this.props.selectedGoods,
    })
  }

  componentDidMount () {
    if (this.props.status === 'entry') {
      this.getGoodsList(this.state.params)
    }

    if (this.props.status === 'outbound') {
      this.getGoodsList(this.state.params)
    }
  }

  /**
   * 获取商品列表
   */
  getGoodsList = (params: PageParams) => {
    const { intl: { locale } } = this.props

    /**
     * 判断当前弹窗是入库还是出库
     * 如果是入库 entry，调用 ‘/purchase/skus’接口
     * 如果是出库 outbound，调用 ‘/warehouse/out/${this.props.warehouseId}/products’接口
     */
    const requestUrl: string = this.props.status === 'entry'
      ? '/purchase/skus'
      : `/warehouse/out/${this.props.warehouseId}/products`

    axios.get(requestUrl, { params }).then(res => {
      const {
        data,
        data: {
          list,
        },
      } = res.data

      const newList = list.map((item: ListsUser) => (
        { ...item,
          name: locale === 'zh' ? item.cnName : item.enName,
          key: item.skuId || item.id,
          id: item.id || item.skuId,
          skuId: item.skuId || item.id,
          page: params.page,
          quantity: item.quantity,
          weight: item.weight,
          price: undefined,
        }
      ))

      /**
       * 每次分页刷新数据
       * 判断每条数据是否存在当前的 totalData
       * 如不存在，更新 totalData
       */
      const newTotal = newList.map((item: ListsUser) => {
        if ((this.state.totalData || []).findIndex((e: ListsUser) => item.key === e.key) === -1) {
          return item
        }

        return undefined
      }).filter((item: ListsUser) => item !== undefined)

      this.setState({
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword,
        },

        total: data.total,
        originData: data,
        dataSource: newList,

        totalData: this.state.totalData.concat(newTotal)
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

  confirmGoodsList = () => {
    this.props.updateSelectGoodsKeys(this.state.temGoods)
  }

  cancelSelectGoods = () => {
    this.props.closeGoodsModal()
  }

  render() {
    const {
      visible,
      intl: { formatMessage },
    } = this.props

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'AddGoodsModal.goods', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 200,
        className: 'name',
        render: (name, goods) => [
          <img key={`${name}img`} src={getPicSrc(goods.mainPic.split('|')[0])} alt=""/>,
          <span key={`${name}name`}>{name}</span>
        ]
      },
      {
        key: 'skuName',
        title: formatMessage({ id: 'AddGoodsModal.skuName', defaultMessage: '标签'}),
        dataIndex: 'skuName',
        width: 100,
        render: (skuName) => {
          if (skuName) {
            return <span>{skuName}</span>
          }
          return <span>{formatMessage({ id: 'AddGoodsModal.noSku', defaultMessage: 'No Sku'})}</span>
        }
      },
      {
        key: 'barCode',
        title: formatMessage({ id: 'AddGoodsModal.barCode', defaultMessage: 'SKU 编码'}),
        dataIndex: 'barCode',
        width: 100,
      },
      // {
      //   key: 'status',
      //   title: formatMessage({ id: 'AddGoodsModal.status', defaultMessage: '操作'}),
      //   dataIndex: 'status',
      //   width: 100,
      //   className: 'status',
      //   // render: () =>
      // },
    ]

    const tableConfig = {
      className: 'add-goods-table',
      scroll: { x: true, y: 300 },
      loading: this.state.loading,
      columns: columns,
      dataSource: this.state.dataSource,
      pagination: {
        size: 'small',
        defaultCurrent: 1,
        total: this.state.total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10'],
        onChange: this.pageChange,
      },
      rowSelection: {
        // getCheckboxProps: (record: any) => {
        //   console.log(record)
        // },
        // selections: {
        //   key: 1,
        //   text: <span>111</span>,
        //   onSelect: (changeableRowKeys: any) => {}
        // },
        selectedRowKeys: (this.state.temGoods || []).map((item: ListsUser) => item.key),
        onChange: (selectedRowKeys: number[], selectedRows: ListsUser[]) => {
          /**
           * 根据 selectedRowKeys 判断 total中是否含有
           * 遍历已有的 temGoods，设置 price 和 quantity的初始值
           */
          const newData = this.state.totalData.filter((item: ListsUser) => {
            return selectedRowKeys.findIndex((e: number) => item.key === e) > -1
          }).map((rows: ListsUser) => {
            const pos = (this.state.totalData || []).findIndex((goods: ListsUser) => rows.key === goods.key)

            const basicItem = {
              ...rows,
              price: pos > -1
                ? (this.state.totalData || []).map((item: ListsUser) => item.price)[pos]
                : undefined,
            }

            if (this.props.status === 'entry') {
              return {
                ...basicItem,
                quantity: pos > -1
                  ? (this.state.totalData || []).map((item: ListsUser) => item.quantity)[pos]
                  : undefined,
              }
            }
            return basicItem
          })

          this.setState({ temGoods: newData })
        },
      }
    }

    return (
      <Modal
        className="add-modal add-goods-modal"
        visible={visible}
        title={formatMessage({ id: 'AddGoodsModal.addGoods', defaultMessage: '添加商品'})}
        okText={formatMessage({ id: 'AddGoodsModal.confirm', defaultMessage: '确定'})}
        cancelText={formatMessage({ id: 'AddGoodsModal.cancel', defaultMessage: '取消'})}
        onOk={this.confirmGoodsList}
        onCancel={this.cancelSelectGoods}
      >
        <header className="modal-header">
          <Search
            onSearch={this.filterByName}
            enterButton={true}
            placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
          />
          <div className="sum">
            <span>
            {formatMessage({ id: 'AddGoodsModal.repo', defaultMessage: '所属仓库'})}:
            <b>{this.props.warehouse}</b>
            </span>
            <span>
              {formatMessage({ id: 'AddGoodsModal.total', defaultMessage: '共'})}
              <b>{this.state.total}</b>
              {formatMessage({ id: 'AddGoodsModal.many', defaultMessage: '件商品'})}
            </span>
          </div>
        </header>

        <Table {...tableConfig}/>
      </Modal>
    )
  }
}

export default injectIntl(AddGoods)
