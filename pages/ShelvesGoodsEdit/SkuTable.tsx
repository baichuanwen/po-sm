/**
 * Created by zhiyang on 2017/8/9.
 */
import * as React from 'react'
import { InputNumber, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'

interface SkuTableProps {
  hasSku: boolean
  disabled: boolean
  onChange?: (data: any) => void
}

interface SkuListProps {
  id?: number
  inventory?: number
  memberPrice?: number
  name?: string
  point?: number
  price?: number
  skuId?: number
  // productSku?: any
}

export default class SkuTable extends React.Component<SkuTableProps> {
  state = {
    skus: []
  }

  handleInputChange = (id: number, type: string, value: number) => {
    const data = this.state.skus.map((sku: SkuListProps) => {
      if (sku.skuId === id) {
        return {
          ...sku,
          [type]: value
        }
      }
      return sku
    })

    this.setState({ skus: data })

    const { onChange } = this.props
    if (onChange) {
      onChange([...data]) // 传递拷贝出去
    }
  }
  /**
   * 组件跟form.item进行了绑定，表单初始化值从 nextProps.value中获取
   * !!! 任何一个form绑定的数据发生变化 都会触发该事件 !!!
   * **/
  componentWillReceiveProps (nextProps: any) {
    const {value} = nextProps
    if (value) {
      this.setState({skus: value})
    }
  }

  render () {
    const dataSource = this.state.skus
    const { hasSku, disabled } = this.props
    const columns: ColumnProps<SkuListProps>[] = [
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        render: (price: number, record: SkuListProps) =>
          <InputNumber
            value={price}
            min={0.01}
            max={99999}
            disabled={disabled}
            onChange={this.handleInputChange.bind(this, record.skuId, 'price')}
          />
      },
      {
        title: '库存',
        dataIndex: 'inventory',
        key: 'inventory',
        render: (inventory: number, record: SkuListProps) =>
          <InputNumber
            value={inventory}
            disabled={disabled}
            parser={(value: any) => value.replace(/\..*/g, '')}
            min={0}
            max={99999}
            onChange={this.handleInputChange.bind(this, record.skuId, 'inventory')}
          />
      }
    ]
    const newColumns = [
      { title: '名称', dataIndex: 'name'},
      ...columns
    ]

    return (
      <div>
        <Table
          rowKey="skuId"
          columns={hasSku ? newColumns : columns}
          dataSource={dataSource}
          pagination={false}
        />
      </div>
    )
  }
}
