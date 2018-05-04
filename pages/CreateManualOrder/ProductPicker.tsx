/**
 * Created by zhiyang on 2017/12/12.
 */
import * as React from 'react'
import { Modal, Table, Input, Button } from 'antd'
import { ModalProps } from 'antd/lib/modal'

import { getPicSrc, adminAxios } from '@Utilities'
import { ProductsProps } from './index.d'

const { Search } = Input

interface ProductPickerProps extends ModalProps {
  checkedProducts: ProductsProps[]
  handleModalCancel: () => void
  onSelect: (action: string, product: ProductsProps) => void
}
class ProductPicker extends React.Component<ProductPickerProps> {
  state = {
    content: [],
    // loading: true,
    totalElements: 0,
    totalPages: 0,
    params: {
      keyword: null,
      page: 0,
      size: 20
    }
  }

  componentDidMount () {
    this.getData()
  }

  getData () {
    const params = {...this.state.params}
    adminAxios.get('/mall/inventory/sku', {params}).then(res => {
      const { content, totalPages, totalElements } = res.data.data
      this.setState({
        // loading: false,
        content,
        totalPages,
        totalElements
      })
    })
  }

  includeProduct = (productId: number) => {
    if (!productId) {
      console.error('缺少 product id')
      return
    }
    return this.props.checkedProducts.find(({ id }: { id: number }) => productId === id)
  }

  toggleProduct = (product: ProductsProps) => {
    let action = this.includeProduct(product.id) ? 'remove' : 'add'
    this.props.onSelect(action, {...product})
  }

  handlePageChange = ({ current }: { current: number }) => {
    const { params } = this.state
    this.setState({
      params: {
        ...params,
        page: current - 1 // 分页是从0开始
      }
    }, this.getData)
  }

  handleSearch = (keyword: string) => {
    keyword = keyword.trim()
    this.setState({
      params: {
        ...this.state.params,
        keyword
      }
    }, this.getData)
  }
  render () {
    const { content, totalElements, params } = this.state
    const { visible, handleModalCancel } = this.props
    const columns = [
      {
        title: '商品图片',
        key: 'img',
        render: (text: string, record: ProductsProps, index: number) => <img src={getPicSrc(record.mainPic)} alt="商品图片" style={{width: '50px'}}/>,
        width: 80
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        width: 150
      },
      {
        title: 'sku名称',
        dataIndex: 'skuName'
      },
      {
        title: '商城售价(元)',
        dataIndex: 'price',
        width: 150
      },
      {
        title: '操作',
        key: 'operator',
        width: 120,
        render: (text: string, record: ProductsProps, index: number) =>
          <Button type="primary" onClick={this.toggleProduct.bind(this, record)}>
            {this.includeProduct(record.id) ? '取消选择' : '选择商品'}
          </Button>,
      }
    ]
    return (
      <Modal
        title="添加商品"
        width="700px"
        visible={visible}
        footer={null}
        onCancel={handleModalCancel}
      >
        <Search
          placeholder="输入关键字搜索商品"
          style={{width: 200}}
          onSearch={this.handleSearch}
        />
        <Table
          rowKey="id"
          columns={columns}
          // loading={loading}
          dataSource={content}
          scroll={{x: true, y: 500}}
          onChange={this.handlePageChange}
          pagination={{total: totalElements, current: params.page + 1, pageSize: params.size}}
        />
      </Modal>
    )
  }
}

export default ProductPicker
