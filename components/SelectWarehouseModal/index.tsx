import * as React from 'react'
import { Select, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal/Modal'
import { injectIntl, InjectedIntlProps } from 'react-intl'
// import { Link } from 'react-router-dom'
// import * as moment from 'moment'

import { axios, pagesRouter, history } from '@Utilities'
// import './index.less'

const { Option } = Select

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

  // hideModal = () => this.setState({ warehouseModalVisible: false })

  render() {
    const {
      intl: { formatMessage }
    } = this.props

    console.log(11111)

    const modalConfig = {
      className: 'warehouse-modal',
      title: '选择仓库',
      visible: this.props.visible,
      okText: formatMessage({ id: 'AddSupplierModal.confirm', defaultMessage: '确定'}),
      cancelText: formatMessage({ id: 'AddSupplierModal.cancel', defaultMessage: '取消'}),
      onOk: this.headToAddNewPO,
      onCancel: this.props.onCancel,
    }

    console.log(this.props)

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
      </div>
    )
  }
}

export default injectIntl(PurchaseOrderList)
