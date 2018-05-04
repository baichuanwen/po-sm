import * as React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Form, Input, Select, Button, Table, InputNumber, message, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, getPicSrc, hasErrors, initTableScroll, pagesRouter, asyncComponent, history } from '@Utilities'
import './index.less'

let uuid = 1
const AddSupplierModal = asyncComponent(() => import(
  /* webpackChunkName: "AddSupplierModal" */'@Components/AddSupplierModal'
))
const AddGoodsModal = asyncComponent(() => import(
  /* webpackChunkName: "AddGoodsModal" */'@Components/AddGoodsModal'
))
const SendEmail = asyncComponent(() => import(
  /* webpackChunkName: "SendEmail" */'@Components/SendEmail'
))

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

interface NewState {
  addSupplierModalVisible?: boolean
  addGoodsModalVisible?: boolean
  confirmButtonLoading?: boolean
  warehouseId?: number | string
  remark?: string
  Warehouse?: Warehouse[]
}

interface ListsUser {
  key: number
  id?: number
  name?: string
  cnName?: string
  enName?: string
  createTime?: number
  hasSku?: boolean
  mainPic: string
  price: number
  quantity: number
  skuId?: string | number
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
  id?: number
  name?: string
  cnName?: string
  enName?: string
}
//
// interface supplierParams {
//   warehouseId: number | string
// }

class AddNewPOForm extends React.Component<
  ListsUser
  & InjectedIntlProps
  & FormComponentProps
  & NewState
> {
  state = {
    addGoodsModalVisible: false,
    addSupplierModalVisible: false,
    sendEmailModalVisible: false,
    mailData: {
      receivers: [],
      templates: [],
      id: undefined
    },
    confirmButtonLoading: false,

    suppliers: [{
      id: -1,
      name: '',
    }],
    supplierId: undefined,
    remark: '',
    status: 0,

    warehouseList: [],
    warehouse: '',
    warehouseId: -1,
    POId: undefined,
    purchaseNo: '',

    selectedGoods: [],
    basicTotalGoods: [],

    saveButtonLoading: false,
  }

  componentDidMount () {
    this.getSupplierList()
    // 页面高度自适应
    initTableScroll()
    addEventListener('resize', initTableScroll)
  }

  // 更新页面高度
  componentDidUpdate () {
    initTableScroll()
  }

  /**
   * 获取 supplier list
   */
  getSupplierList = () => {
    const { intl: { locale } } = this.props
    const { location: { search } } = history

    /**
     * 获取当前的 id lists
     * 路由格式为 ?warehouseid=2&poid=2
     */
    const idList = search.split('=')
      .map((item: string) => item.split('&'))
      .reduce((pre: string[], next: string[]) => pre.concat(next))
      .filter((item: string, index: number) => index % 2 === 1)

    const warehouseId = idList[0]
    const POId = idList[1]

    /**
     * 判断当前的路由是否是编辑状态
     * 如果是，请求任务添加获取 PO detail的接口
     */
    // const supplierParams: supplierParams = {
    //   warehouseId: warehouseId
    // }
    let requestTasks = [
      axios.get('/warehouse'),
      axios.get(`/supplier/list?warehouseId=${warehouseId}`)
    ]
    if (search.includes('poid')) {
      requestTasks = [
        axios.get('/warehouse'),
        axios.get(`/supplier/list?warehouseId=${warehouseId}`),
        axios.get(`/purchase/${POId}`)
      ]
    }

    Promise.all(requestTasks).then(res => {
      const { data } = res[0].data
      const { list } = res[1].data.data

      /**
       * 初始化 PODetail
       * 当路由包含 poid
       * 获取接口数据，初始化 PO单详情
       */
      let PODetail = {
        supplierId: undefined,
        remark: '',
        selectedGoods: [],
        basicTotalGoods: [],
        purchaseNo: '',
        status: 0,
      }
      if (search.includes('poid')) {
        const { purchaseNo, supplierId, remark, productSkuVOList, status } = res[2].data.data
        const newGoodsList = productSkuVOList.map((item: ListsUser) => ({
          ...item,
          key: item.skuId,
          name: locale === 'zh' ? item.cnName : item.enName,
        }))

        PODetail = {
          status,
          purchaseNo,
          supplierId,
          remark,
          selectedGoods: newGoodsList,
          basicTotalGoods: newGoodsList,
        }
      }

      const warehouseInfo = data
        .map((item: Warehouse) => ({
          ...item,
          name: locale === 'zh' ? item.cnName : item.enName
        }))
        .filter((item: Warehouse) => `${item.id}` === warehouseId)[0]
      const newWarehouseList = data.map((item: Warehouse) => ({
        ...item,
        name: locale === 'zh' ? item.cnName : item.enName
      }))

      this.setState({
        warehouseList: newWarehouseList,
        warehouse: warehouseInfo.name,
        warehouseId: warehouseId,

        POId: POId,
        suppliers: list,
        ...PODetail,
      })
    })
  }

  /**
   * 打开新增供应商的 modal
   */
  addSupplier = () => {
    this.setState({ addSupplierModalVisible: true })
  }

  /**
   * 关闭新增供应商的 modal
   */
  closeSupllierModal = () => {
    this.setState({ addSupplierModalVisible: false })
  }

  /**
   * 创建新的 supplier
   * 刷新 supplier list
   */
  createOrEditSupplier = (supplierParams: SupplierInfo, id: number) => {
    const {
      intl: { formatMessage }
    } = this.props

    this.setState({ confirmButtonLoading: true })

    // add supplier
    axios.post(`supplier/${this.state.warehouseId}`, supplierParams)
      .then(res => {
        if (res.data.ok) {
          this.setState({
            addSupplierModalVisible: false,
            confirmButtonLoading: false,
          })
          message.success(formatMessage({
            id: 'PurchaseSuppliers.createSuccess',
            defaultMessage: '创建供应商成功'
          }))

          // 刷新列表
          this.getSupplierList()
        }
      })
      .catch(() => { this.setState({ confirmButtonLoading: false }) })
  }

  /**
   * 打开商品的 modal
   */
  addGoods = () => {
    this.setState({ addGoodsModalVisible: true })
  }

  /**
   * 关闭添加商品的 modal
   */
  closeGoodsModal = () => {
    this.setState({ addGoodsModalVisible: false })
  }

  /**
   * 打开发送邮件的 modal
   */
  sendEmail = (id: number | undefined) => {
    axios.get(`/purchase/${id}/mail/loading`).then(res => {
      const { data } = res.data
      this.setState({
        mailData: data,
        sendEmailModalVisible: true,
      })
    })
  }

  /**
   * 关闭添加商品的 modal
   */
  closeSendEmailModal = () => {
    // this.setState({ sendEmailModalVisible: false })
    history.push(pagesRouter.PurchaseOrderList)
  }

  /**
   * 更新被选中的 goods lists
   */
  updateSelectGoodsKeys = (selectGoods: ListsUser[]) => {
    /**
     * 如果删除了原来 basicTotal goods内的商品
     * 找到被删除商品的 ids
     */
    // const ids = (this.state.basicTotalGoods || [])
    //   .map((totalItem: ListsUser) => {
    //     const pos = selectGoods
    //       .map((goodsItem: ListsUser) => goodsItem.key)
    //       .findIndex((rowkey: number) => totalItem.key === rowkey)
    //
    //     if (pos === -1) {
    //       return totalItem.id
    //     }
    //     return undefined
    //   })
    //   .filter((item: number) => item !== undefined)

    /**
     * --- 如果 ids.length > 0,
     * 调用商品删除接口
     * 更新 basictaotal goods 和 selectedGoods，关闭弹窗
     * --- 如果 ids.length === 0
     * 直接更新 basictaotal goods 和 selectedGoods，关闭弹窗
     */
    // console.log(ids)
    // if (ids.length > 0) {
    //   axios.put(`/purchase/${this.state.POId}/item`, ids).then(res => {
    //     const { data } = res
    //     if (data.code === 0) {
    //       const newBasicTotalGoods = (this.state.basicTotalGoods || [])
    //         .filter((item: ListsUser) => {
    //           const basicPos = ids.findIndex((id: number) => id === item.id)
    //           return basicPos === -1
    //         })
    //
    //       this.setState({
    //         addGoodsModalVisible: false,
    //         selectedGoods: selectGoods,
    //         basicTotalGoods: newBasicTotalGoods,
    //       })
    //     }
    //   })
    // } else {
      this.setState({
        addGoodsModalVisible: false,
        selectedGoods: selectGoods
      })
    // }
  }

  /**
   * 删除对应的 goods
   */
  deleteGoods = (key: number) => {
    /**
     * 如果当前为编辑页面
     * 调用接口，删除 PO单中的具体商品
     */
    // const pos = this.state.basicTotalGoods.findIndex((item: ListsUser) => item.id === id)
    // if (this.state.POId && pos > -1) {
    //   /**
    //    * 初始化 basicTotalGoods
    //    * 如果 basicTotalGoods中包含被删除的 goods
    //    * 调用删除接口，删除商品
    //    * 若不包含，直接删除商品即可
    //    * update basic tatals goods list
    //    */
    //   const params = [id]
    //   axios.put(`/purchase/${this.state.POId}/item`, params).then(res => {
    //     const { data } = res
    //     if (data.code === 0) {
    //       this.setState({
    //         basicTotalGoods: this.state.basicTotalGoods.filter((item: ListsUser) => item.id !== id),
    //         selectedGoods: this.state.selectedGoods.filter((item: ListsUser) => item.id !== id)
    //       })
    //     }
    //   })
    // }
    return this.setState({
      selectedGoods: this.state.selectedGoods.filter((item: ListsUser) => item.key !== key)
    })
  }

  /**
   * 局部更新 price and quantity
   */
  updateDetailPriceAndQuantity = (key: string, id: number, value: number) => {
    // console.log(key)
    // console.log(id)
    // console.log(value)

    const newSelectedGoods = this.state.selectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          [key]: value,
        }
      }

      return item
    })

    this.setState({
      selectedGoods: newSelectedGoods
    })
  }

  /**
   * submit Form Data
   */
  // tslint:disable-next-line
  submitFormData = (type: string): any => {
    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      intl: { formatMessage },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error(
        formatMessage({
          id: 'Login.formWarningMes',
          defaultMessage: '表单填写有误，请仔细检查表单'
        })
      )
    }

    // tslint:disable-next-line
    const formData: any = getFieldsValue()
    const productSkuBodies = this.state.selectedGoods.map((item: ListsUser) => ({
      price: item.price,
      quantity: item.quantity,
      skuId: item.key
    }))

    if (productSkuBodies.length === 0) {
      return message.error(
        formatMessage({
          id: 'AddNewPO.skuSelectReqiured',
          defaultMessage: '请至少选择一个商品'
        })
      )
    }

    const params = {
      productSkuBodies,
      warehouseId: this.state.warehouseId,
      supplierId: formData.supplierId,
      remark: formData.remark ? formData.remark : '',
      sendMail: false,
    }

    this.createOrEditPO(params, type)
  }

  /**
   * create Or Edit PO
   */
  // tslint:disable-next-line
  createOrEditPO = (params: any, type: string) => {
    const {
      intl: { formatMessage }
    } = this.props
    this.setState({ saveButtonLoading: true })
    if (this.state.POId) {
      /**
       * 采购单编辑
       */
      axios.put(`/purchase/${this.state.POId}`, params).then(res => {
        const { data } = res
        this.setState({ saveButtonLoading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'AddNewPO.editSuccess',
              defaultMessage: '采购订单编辑成功'
            })
          )

          /**
           * 判断点击了哪个保存按钮
           * 若是send email，则弹出 send email modal
           * 若是save，跳转到 list页面
           */
          if (type === 'save') {
            setTimeout(() => history.push(pagesRouter.PurchaseOrderList), 800)
          } else {
            this.sendEmail(this.state.POId)
          }
        }
      }).catch(() => { this.setState({ saveButtonLoading: false }) })
    } else {
      /**
       * 采购单创建
       */
      axios.post(`/purchase/${this.state.warehouseId}`, params).then(res => {
        const { data } = res
        this.setState({ saveButtonLoading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'AddNewPO.createSuccess',
              defaultMessage: '采购订单创建成功'
            })
          )

          /**
           * 判断点击了哪个保存按钮
           * 若是send email，则弹出 send email modal
           * 若是save，跳转到 list页面
           */
          if (type === 'save') {
            setTimeout(() => history.push(pagesRouter.PurchaseOrderList), 800)
          } else {

            this.sendEmail(data.data)
          }
        }
      }).catch(() => { this.setState({ saveButtonLoading: false }) })
    }
  }

  render () {
    const {
      form: {
        getFieldDecorator,
      },
      intl,
      intl: { formatMessage }
    } = this.props

    const { location: { pathname, search } } = history

    const goodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 6, xl: 6},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 15},
    }

    const viewColLayout = {sm: 12, md: 12, lg: 8, xl: 8}
    const viewGoodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 9, xl: 6},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 15},
    }

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'AddNewPO.goods', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 300,
        // fixed: 'left',
        className: 'name',
        render: (name, goods) => <>
          <img src={getPicSrc((goods.mainPic).split('|')[0])} alt=""/>
          <span>{name}</span>
        </>
      },
      {
        key: 'skuName',
        title: formatMessage({ id: 'AddNewPO.skuName', defaultMessage: '商品规格'}),
        dataIndex: 'skuName',
        width: 150,
        render: (skuName) => {
          if (skuName) {
            return <span>{skuName}</span>
          }
          return <span>{formatMessage({ id: 'AddGoodsModal.noSku', defaultMessage: '无规格'})}</span>
        }
      },
      {
        key: 'barCode',
        title: formatMessage({ id: 'AddNewPO.skuCode', defaultMessage: '建建议零售价'}),
        dataIndex: 'barCode',
        width: 150,
      },
      {
        key: 'quantity',
        title: formatMessage({ id: 'AddNewPO.quantity', defaultMessage: '创建时间'}),
        dataIndex: 'quantity',
        width: 150,
        render: (quantity, goods) => {
          if (pathname.includes('view')) {
            return <span>{quantity}</span>
          } else {
            return (
              <FormItem className="po-supplier-detail">
                {getFieldDecorator(`${goods.id}${quantity}quantity`, {
                  initialValue: quantity,
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'AddNewPO.quantityReqiured', defaultMessage: '请输入数量' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={100000000}
                    style={{width: 110}}
                    onChange={this.updateDetailPriceAndQuantity.bind(this, 'quantity', goods.id)}
                    placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
                  />
                )}
              </FormItem>
            )
          }
        },
      },
      {
        key: 'price',
        title: formatMessage({ id: 'AddNewPO.price', defaultMessage: '建建议零售价'}),
        dataIndex: 'price',
        width: 150,
        render: (price, goods) => {
          if (pathname.includes('view')) {
            return <span>{price}</span>
          } else {
            return (
              <FormItem className="po-supplier-detail">
                {getFieldDecorator(`${goods.id}${price}price`, {
                  initialValue: price,
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'AddNewPO.priceReqiured', defaultMessage: '请输入价格' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={100000000}
                    style={{width: 110}}
                    onChange={this.updateDetailPriceAndQuantity.bind(this, 'price', goods.id)}
                    placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
                  />
                )}
              </FormItem>
            )
          }
        },
      },
      {
        key: 'sumPrice',
        title: formatMessage({ id: 'AddNewPO.sumPrice', defaultMessage: '创建时间'}),
        dataIndex: 'sumPrice',
        width: 150,
        // sorter: (a: number, b: number) => a - b,
        render: (sumPrice: undefined, goods) => {
          if (goods.price && goods.quantity) {
            return <span>{goods.price * goods.quantity}</span>
          }
          return <span>0</span>
        }
      },
    ]

    const Operation: ColumnProps<ListsUser>[] = [
      {
        key: 'operation',
        title: formatMessage({ id: 'AddNewPO.operation', defaultMessage: '操作'}),
        dataIndex: 'operation',
        width: 120,
        // fixed: 'right',
        className: 'operation',
        render: (operation, goods) => (
          <a onClick={this.deleteGoods.bind(this, goods.key)}>
          {formatMessage({ id: 'AddNewPO.delete', defaultMessage: '删除'})}
          </a>
        )
      }
    ]

    const tableConfig = {
      scroll: {
        x: 1160,
        y: 1,
      },
      className: 'purchase-table',
      columns: !pathname.includes('view') ? columns.concat(Operation) : columns,
      dataSource: this.state.selectedGoods,
      pagination: false,
      // pagination: {
      //   size: 'small',
      //   pageSize: totalSumQuantity,
      // },
    }

    const totalSumPrice = this.state.selectedGoods
      .map((item: ListsUser) => item.price * item.quantity)
      .filter((item: number) => !Number.isNaN(item))

    const totalSumQuantity = this.state.selectedGoods
      .map((item: ListsUser) => item.quantity)
      .filter((item: number) => !Number.isNaN(item) && item !== undefined)

    const supplierModalConfig = {
      supplierId: -1,
      intl: intl,
      visible: this.state.addSupplierModalVisible,
      confirmButtonLoading: this.state.confirmButtonLoading,
      closeSupllierModal: this.closeSupllierModal,
      createOrEditSupplier: this.createOrEditSupplier,
    }

    const goodsModalConfig = {
      // supplierId: -1,
      warehouse: this.state.warehouse,
      warehouseId: this.state.warehouseId,
      status: 'entry',
      className: 'add-goods-modal',
      intl: intl,
      visible: this.state.addGoodsModalVisible,
      closeGoodsModal: this.closeGoodsModal,
      selectedGoods: this.state.selectedGoods,
      updateSelectGoodsKeys: this.updateSelectGoodsKeys,
    }

    const sendEmailConfig = {
      className: 'send-email-modal',
      mailData: this.state.mailData,
      intl: intl,
      visible: this.state.sendEmailModalVisible,
      closeSendEmailModal: this.closeSendEmailModal,
    }

    return (
      <Form className="add-newPO" onSubmit={this.submitFormData.bind(this, 'save')}>
        { this.state.addSupplierModalVisible &&
          <AddSupplierModal key={`supplier${uuid++}`} {...supplierModalConfig}/>
        }
        { this.state.addGoodsModalVisible &&
          <AddGoodsModal key={`goods${uuid++}`} {...goodsModalConfig}/>
        }
        { this.state.sendEmailModalVisible &&
          <SendEmail key={`email${uuid++}`} {...sendEmailConfig}/>
        }
        {pathname.includes('view') &&
          <Button className="backto-pre">
            <Icon type="rollback" />
            <Link to={pagesRouter.PurchaseOrderList}>
            {formatMessage({ id: 'AddNewPO.backtoPre', defaultMessage: '返回上一页' })}
            </Link>
          </Button>
        }
        <article className="supplier">
          <section className="select-supplier basic-info">
            {(pathname.includes('edit') || pathname.includes('create')) &&
              <Row>
                <Col className="select-supplier" span={12}>
                  {/**
                    * 判断当前路由是否含有 poid
                    */
                    pathname.includes('edit') &&
                    <FormItem
                      {...goodsInfoFormLayout}
                      label={<FormattedMessage id={'AddNewPO.orderNumber'}/>}
                      className="po-supplier-detail"
                    >
                      <div className="po-supplier-code">{this.state.purchaseNo}</div>
                    </FormItem>
                  }
                  <FormItem
                    {...goodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.supplierId'}/>}
                    className="po-supplier-detail"
                  >
                    {getFieldDecorator('supplierId', {
                      initialValue: this.state.supplierId,
                      validateTrigger: 'onBlur',
                      rules: [
                        {
                          required: true,
                          message: formatMessage({ id: 'CreateGoods.supplierRequired', defaultMessage: '请选择供应商' })
                        }
                      ],
                    })(
                      /**
                       * 如果当前的
                       */
                      this.state.POId
                        ? <div className="po-supplier-code" >
                          {this.state.suppliers.filter(item => item.id === this.state.supplierId)[0].name}
                          </div>
                        : <Select placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}>
                          {this.state.suppliers.map(item =>
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )}
                        </Select>
                      )}
                  </FormItem>
                  <FormItem
                    {...goodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.remark'}/>}
                    className="po-supplier-detail"
                  >
                    {getFieldDecorator('remark', {
                      initialValue: this.state.remark,
                      validateTrigger: 'onBlur',
                    })(
                      <TextArea
                        autosize={{ minRows: 3, maxRows: 6 }}
                        placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                      />
                    )}
                  </FormItem>
                </Col>
                {/**
                  * 判断当前路由是否含有 poid
                  */
                  !search.includes('poid') &&
                  <Col className="add-supplier" span={12}>
                    <Button type="primary" onClick={this.addSupplier}>
                    {formatMessage({ id: 'AddNewPO.addSupplier', defaultMessage: '添加供应商' })}
                    </Button>
                  </Col>
                }
              </Row>
            }
            {pathname.includes('view') &&
              <Row>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.orderNumber'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code">{this.state.purchaseNo}</div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.purchaseSumQuantity'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price">
                      {totalSumQuantity.length > 0
                        ? totalSumQuantity.reduce((pre: number, next: number) => pre + next)
                        : 0
                      }
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.remark'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.remark}
                    </div>
                  </FormItem>
                </Col>

                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.supplierId'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.POId &&
                        this.state.suppliers.filter(item =>
                          item.id === this.state.supplierId
                        )[0].name
                      }
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.purchaseSumPrice'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      <b className="price">
                        {totalSumPrice.length > 0
                          ? totalSumPrice.reduce((pre: number, next: number) => pre + next)
                          : 0
                        }
                      </b>
                    </div>
                  </FormItem>
                </Col>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.orderStatus'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      {this.state.status === 0 && formatMessage({id: 'POList.waitIn', defaultMessage: '待入库'})}
                      {this.state.status === 1 && formatMessage({id: 'POList.partIn', defaultMessage: '部分入库'})}
                      {this.state.status === 2 && formatMessage({id: 'POList.allIn', defaultMessage: '全部入库'})}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewPO.Repo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.warehouse}
                    </div>
                  </FormItem>
                </Col>
              </Row>
            }
          </section>
        </article>

        <article className="purchase-goods">
          <div className="purchase-goods-header goods-header">
            <div className="purchase-add-goods">
              <h3>{formatMessage({ id: 'AddNewPO.purchaseGoods', defaultMessage: '采购商品' })}</h3>
              {!pathname.includes('view') &&
                <Button type="primary" onClick={this.addGoods}>
                {formatMessage({ id: 'AddNewPO.addGoods', defaultMessage: '添加商品' })}
                </Button>
              }
            </div>
            {!pathname.includes('view') &&
              <div className="purchase-goods-sum">
                <span>
                {formatMessage({ id: 'AddNewPO.Repo', defaultMessage: '所属仓库' })}:
                <b className="price">{this.state.warehouse}</b>
                </span>
                <span>
                {formatMessage({ id: 'AddNewPO.purchaseSumQuantity', defaultMessage: '采购总数' })}:
                <b className="price">
                {totalSumQuantity.length > 0
                  ? totalSumQuantity.reduce((pre: number, next: number) => pre + next)
                  : 0
                }
                </b>
                </span>
                <span>
                {formatMessage({ id: 'AddNewPO.purchaseSumPrice', defaultMessage: '采购总额' })}:
                <b className="price">
                {totalSumPrice.length > 0 ? totalSumPrice.reduce((pre: number, next: number) => pre + next) : 0}
                </b>
                </span>
              </div>
            }
          </div>

          <Table {...tableConfig} />
        </article>

        {!pathname.includes('view') &&
          <div className="operation-button">
            <Button
              type="primary"
              onClick={this.submitFormData.bind(this, 'mail')}
            >
            {formatMessage({ id: 'AddNewPO.saveAndSendEmail', defaultMessage: '保存并发送' })}
            </Button>
            <Button
              onClick={this.submitFormData.bind(this, 'save')}
              disabled={this.state.saveButtonLoading}
              loading={this.state.saveButtonLoading}
            >
            {formatMessage({ id: 'AddNewPO.save', defaultMessage: '保存' })}
            </Button>
            <Button>
              <Link to={pagesRouter.PurchaseOrderList}>
              {formatMessage({ id: 'AddNewPO.cancel', defaultMessage: '取消' })}
              </Link>
            </Button>
          </div>
        }
      </Form>
    )
  }
}

const AddNewPO = Form.create<{}>()(AddNewPOForm)

export default injectIntl(AddNewPO)
