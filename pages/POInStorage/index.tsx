import * as React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Form, Button, Table, InputNumber, message, DatePicker, Input, Checkbox, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import { DatePickerProps } from 'antd/lib/date-picker'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, getPicSrc, hasErrors, pagesRouter, history } from '@Utilities'
import './index.less'

const FormItem = Form.Item
const { Search } = Input

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
  advanceSale?: false
  advanceSaleDay?: number
  advanceSaleQty?: number
  receiveTime?: string
  itemId?: number
  locationNo?: string
  productionDate?: string
  psNumber?: number
  entryWarehouseQty: number
  modalWaring: false
}

interface Warehouse {
  id?: number
  name?: string
  cnName?: string
  enName?: string
}

class AddNewPOForm extends React.Component<
  ListsUser
  & InjectedIntlProps
  & FormComponentProps
  & DatePickerProps
  & NewState
> {
  state = {
    confirmButtonLoading: false,

    suppliers: [{
      id: -1,
      name: '',
    }],
    supplierId: undefined,
    supplierName: '',
    remark: '',
    status: 0,
    totalQty: 0,
    totalAmount: 0,

    warehouseList: [],
    warehouse: '',
    warehouseId: -1,
    POId: undefined,
    purchaseNo: '',

    selectedGoods: [],
    totalSelectedGoods: [],

    saveButtonLoading: false,
  }

  /**
   * 设置 table content body的最大高度
   * 获得当前页面的 main-content的 DOM节点
   * 除去 thead, padding, pageFooter
   * 目的是为了页面高度自适应
   */
  initTableScroll = () => {
    const tableScroll = document.getElementsByClassName('ant-table-body')[0] as HTMLElement
    // const firstTableScrollInner = document.getElementsByClassName('ant-table-body-inner')[0] as HTMLElement
    const goodsLists = document.getElementsByClassName('main-content')[0] as HTMLElement

    const thead = document.getElementsByTagName('thead')[0] as HTMLElement
    const listsPadding = 0
    const pageFooter = 16
    const footerAndPadding = listsPadding + pageFooter

    let height = goodsLists.offsetHeight - thead.offsetHeight - footerAndPadding

    /**
     * operation button 存在
     */
    const operationButton = document.getElementsByClassName('operation-button')[0] as HTMLElement
    if (operationButton) {
      height -= operationButton.offsetHeight
    }

    const purchaseGoodsHeader = document.getElementsByClassName('instorage-goods-header')[0] as HTMLElement
    if (purchaseGoodsHeader) {
      height -= purchaseGoodsHeader.offsetHeight
    }

    const selectSupplier = document.getElementsByClassName('in-storage-brief-info')[0] as HTMLElement
    if (selectSupplier) {
      height -= selectSupplier.offsetHeight
    }

    // const antTablePagination = document.getElementsByTagName('ant-table-pagination')[0] as HTMLElement
    // if (antTablePagination) {
    //   height -= antTablePagination.offsetHeight
    // }

    tableScroll.style['max-height'] = height + 'px'
    tableScroll.style['min-height'] = height + 'px'
    tableScroll.style['overflow-x'] = 'auto'
    tableScroll.style['overflow-y'] = 'auto'

    // firstTableScrollInner.style['max-height'] = height + 'px'
    // firstTableScrollInner.style['min-height'] = height + 'px'
  }

  componentDidMount () {
    this.getSupplierList()
    // 页面高度自适应
    this.initTableScroll()
    addEventListener('resize', this.initTableScroll)
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

    Promise.all([
      axios.get('/warehouse'),
      axios.get(`/purchase/${POId}`)
    ]).then(res => {
      const { data } = res[0].data
      /**
       * 初始化 PODetail
       * 当路由包含 poid
       * 获取接口数据，初始化 PO单详情
       */
      const {
        purchaseNo,
        supplierId,
        supplierName,
        remark,
        productSkuVOList,
        status,
        totalQty,
        totalAmount,
      } = res[1].data.data
      const newGoodsLists = productSkuVOList.map((item: ListsUser) => ({
        ...item,
        key: item.skuId,
        name: locale === 'zh' ? item.cnName : item.enName,
        advanceSale: false,
        productionDate: undefined,
      }))
      let PODetail = {
        status,
        purchaseNo,
        supplierId,
        supplierName,
        remark,
        totalQty,
        totalAmount,
        totalSelectedGoods: newGoodsLists,
        selectedGoods: newGoodsLists,
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
        ...PODetail,
      })
    })
  }

  /**
   * 更新被选中的 goods lists
   */
  updateSelectGoodsKeys = (selectGoods: ListsUser[]) => {
    this.setState({
      addGoodsModalVisible: false,
      selectedGoods: selectGoods
    })
  }

  /**
   * 局部更新 price and quantity
   * 添加全局搜索功能
   * 同时更新 totalSelectedGoods
   */
  updateGoodsDetail = (key: string, id: number, value: number) => {
    // console.log(key)
    // console.log(id)
    // console.log(value)
    // * 同时更新 totalSelectedGoods
    const newTotalSelectedGoods = this.state.totalSelectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          [key]: value,
        }
      }

      return item
    })

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
      selectedGoods: newSelectedGoods,
      totalSelectedGoods: newTotalSelectedGoods,
    })
  }

  setAdvanceSale = (id: number) => {
    // * 同时更新 totalSelectedGoods
    const newTotalSelectedGoods = this.state.totalSelectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          advanceSale: !item.advanceSale,
        }
      }
      return item
    })

    const newSelectedGoods = this.state.selectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          advanceSale: !item.advanceSale,
        }
      }
      return item
    })
    this.setState({
      selectedGoods: newSelectedGoods,
      totalSelectedGoods: newTotalSelectedGoods,
    })
  }

  updateGoodsLocationNo = (id: number, e: React.SyntheticEvent<HTMLInputElement>) => {
    // * 同时更新 totalSelectedGoods
    const newTotalSelectedGoods = this.state.totalSelectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          locationNo: (e.target as HTMLInputElement).value,
        }
      }
      return item
    })

    const newSelectedGoods = this.state.selectedGoods.map((item: ListsUser) => {
      if (item.id === id) {
        return {
          ...item,
          locationNo: (e.target as HTMLInputElement).value,
        }
      }
      return item
    })
    this.setState({
      selectedGoods: newSelectedGoods,
      totalSelectedGoods: newTotalSelectedGoods,
    })
  }

  filterByName = (value: string) => {
    let newSelectedGoods = []
    if (value !== '') {
      newSelectedGoods = this.state.selectedGoods.filter((item: ListsUser) =>
        item.name && item.name.includes(value)
      )
    } else {
      newSelectedGoods = this.state.totalSelectedGoods
    }

    this.setState({ selectedGoods: newSelectedGoods })
  }

  /**
   * submit Form Data
   */
  // tslint:disable-next-line
  submitFormData = (): any => {
    const {
      form: {
        // getFieldsValue,
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
    // const formData: any = getFieldsValue()
    const entryWarehouseItemBodies = this.state.selectedGoods
      .filter((item: ListsUser) => item.psNumber !== 0 && item.psNumber !== undefined)
      .map((item: ListsUser) => {
        const basicItem = {
          advanceSale: item.advanceSale,
          advanceSaleDay: item.advanceSale ? item.advanceSaleQty : 0,
          advanceSaleQty: item.advanceSale ? item.advanceSaleQty : 0,
          receiveTime: item.advanceSale ? item.receiveTime : '',
          itemId: item.id,
          locationNo: item.locationNo ? item.locationNo : 0,
          productionDate: moment(item.productionDate).format('YYYY-MM-DD'),
          quantity: item.psNumber,
        }

        // if (productionDate) {
        //   return {
        //     ...basicItem,
        //     productionDate: item.productionDate,
        //   }
        // }

        return basicItem
      })

    if (entryWarehouseItemBodies.length === 0) {
      return message.error(
        formatMessage({
          id: 'InStorage.selectedInstorageGoods',
          defaultMessage: '请最少选择一个商品入库'
        })
      )
    }

    const params = {
      orderId: this.state.POId,
      entryWarehouseItemBodies
    }

    // console.log(params)
    this.goodsInStorage(params)
  }

  /**
   * create Or Edit PO
   */
  // tslint:disable-next-line
  goodsInStorage = (params: any) => {
    const {
      intl: { formatMessage }
    } = this.props
    this.setState({ saveButtonLoading: true })
    /**
     * 商品入库
     */
    axios.post(`/warehouse/entry`, params).then(res => {
      const { data } = res
      this.setState({ saveButtonLoading: false })
      if (data.code === 0) {
        message.success(
          formatMessage({
            id: 'InStorage.inStorageSuccess',
            defaultMessage: '商品入库成功'
          })
        )

        /**
         * 判断点击了哪个保存按钮
         * 若是send email，则弹出 send email modal
         * 若是save，跳转到 list页面
         */
        setTimeout(() => history.push(pagesRouter.PurchaseOrderList), 800)
      }
    }).catch(() => { this.setState({ saveButtonLoading: false }) })
  }

  render () {
    const {
      form: {
        getFieldDecorator,
      },
      intl: { formatMessage }
    } = this.props

    const viewColLayout = {sm: 12, md: 12, lg: 8, xl: 8}
    const viewGoodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 9, xl: 6},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 15},
    }

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'InStorage.goods', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 300,
        // fixed: 'left',
        className: 'goods-name',
        render: (name, goods) => <>
          <img src={getPicSrc((goods.mainPic).split('|')[0])} alt=""/>
          <span>{name}</span>
        </>
      },
      {
        key: 'skuName',
        title: formatMessage({ id: 'InStorage.skuName', defaultMessage: '商品规格'}),
        dataIndex: 'skuName',
        width: 150,
        render: (skuName) => {
          if (skuName) {
            return <span>{skuName}</span>
          }
          return <span>{formatMessage({ id: 'AddGoodsModal.noSku', defaultMessage: 'No Sku'})}</span>
        }
      },
      {
        key: 'quantity',
        title: formatMessage({ id: 'InStorage.quantity', defaultMessage: '采购数量'}),
        dataIndex: 'quantity',
        width: 150,
      },
      {
        key: 'entryWarehouseQty',
        title: formatMessage({ id: 'InStorage.entryWarehouseQty', defaultMessage: '已入库数'}),
        dataIndex: 'entryWarehouseQty',
        width: 150,
      },
      {
        key: 'psNumber',
        title: formatMessage({ id: 'InStorage.psNumber', defaultMessage: '生产日期'}),
        dataIndex: 'psNumber',
        width: 200,
        render: (psNumber, goods) => (
          <FormItem
            className="po-supplier-detail"
            extra={
              psNumber > goods.quantity - goods.entryWarehouseQty
              ? <div key={`${goods.id}${psNumber}Icon`}>
                <Icon type="info-circle" />
                {formatMessage({ id: 'InStorage.exceedingMaximum', defaultMessage: '入库数超出采购数'})}
              </div>
              : 0
            }
          >
            {getFieldDecorator(`${goods.id}${psNumber}psNumber`, {
              initialValue: psNumber,
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: psNumber ? true : false,
                  message: formatMessage({ id: 'InStorage.psNumber', defaultMessage: '请输入数量' })
                }
              ],
            })(
              <InputNumber
                min={1}
                max={100000000}
                style={{width: 110}}
                onChange={this.updateGoodsDetail.bind(this, 'psNumber', goods.id)}
                placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
              />
            )}
          </FormItem>
        ),
      },
      {
        key: 'productionDate',
        title: formatMessage({ id: 'InStorage.productionDate', defaultMessage: '生产日期'}),
        dataIndex: 'productionDate',
        width: 150,
        render: (productionDate, goods) => {
          if (goods.psNumber) {
            return (
              <FormItem className="po-supplier-detail ">
                {getFieldDecorator(`${goods.id}${true}productionDate`, {
                  initialValue: productionDate,
                  rules: [
                    {
                      type: 'object',
                      required: true,
                      message: formatMessage({ id: 'InStorage.productionDate', defaultMessage: '请输入生产日期' })
                    },
                  ],
                })(
                  <DatePicker
                    style={{width: 120}}
                    onChange={this.updateGoodsDetail.bind(this, 'productionDate', goods.id)}
                    // tslint:disable-next-line
                    getCalendarContainer={(): any => document.getElementsByClassName('ant-table-tbody')[0]}
                    format="YYYY-MM-DD"
                  />
                )}
              </FormItem>
            )
          }
          return (
            <FormItem className="po-supplier-detail">
              {getFieldDecorator(`${goods.id}productionDate`, {
                initialValue: productionDate,
                rules: [],
              })(
                <DatePicker
                  style={{width: 120}}
                  onChange={this.updateGoodsDetail.bind(this, 'productionDate', goods.id)}
                  // tslint:disable-next-line
                  getCalendarContainer={(): any => document.getElementsByClassName('ant-table-tbody')[0]}
                  format="YYYY-MM-DD"
                />
              )}
            </FormItem>
          )
        },
      },
      {
        key: 'locationNo',
        title: formatMessage({ id: 'InStorage.locationNo', defaultMessage: '生产日期'}),
        dataIndex: 'locationNo',
        width: 150,
        render: (locationNo, goods) => (
          <FormItem className="po-supplier-detail">
            <Input
              onChange={this.updateGoodsLocationNo.bind(this, goods.id)}
              style={{width: 110}}
              placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
            />
          </FormItem>
        ),
      },
      {
        key: 'advanceSale',
        title: formatMessage({ id: 'InStorage.advanceSaleSetting', defaultMessage: '生产日期'}),
        dataIndex: 'advanceSale',
        width: 200,
        render: (advanceSale, goods) => {
          if (advanceSale) {
            return <>
              <Checkbox checked={advanceSale} onChange={this.setAdvanceSale.bind(this, goods.id)}>
                {formatMessage({ id: 'InStorage.advanceSale', defaultMessage: '预售商品' })}
              </Checkbox>
              <FormItem key={`${goods.id}${advanceSale}receiveTime`}>
                {getFieldDecorator(`${goods.id}${advanceSale}receiveTime`, {
                  // validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'InStorage.receiveTime', defaultMessage: '预售设置' })
                    }
                  ],
                })(
                  <DatePicker
                    style={{width: 150}}
                    onChange={this.updateGoodsDetail.bind(this, 'receiveTime', goods.id)}
                    // tslint:disable-next-line
                    getCalendarContainer={(): any => document.getElementsByClassName('ant-table-tbody')[0]}
                    format="YYYY-MM-DD"
                  />
                )}
              </FormItem>
              <FormItem key={`${goods.id}${advanceSale}advanceSaleDay`}>
                {getFieldDecorator(`${goods.id}${advanceSale}advanceSaleDay`, {
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'InStorage.advanceSaleDay', defaultMessage: '预售设置' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{width: 150}}
                    onChange={this.updateGoodsDetail.bind(this, 'advanceSaleDay', goods.id)}
                    placeholder={formatMessage({ id: 'InStorage.advanceSaleDay', defaultMessage: '建议预售天数'})}
                  />
                )}
              </FormItem>
              <FormItem key={`${goods.id}${advanceSale}advanceSaleQty`}>
                {getFieldDecorator(`${goods.id}${advanceSale}advanceSaleQty`, {
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'InStorage.advanceSaleQty', defaultMessage: '建议预售数量' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{width: 150}}
                    onChange={this.updateGoodsDetail.bind(this, 'advanceSaleQty', goods.id)}
                    placeholder={formatMessage({ id: 'InStorage.advanceSaleQty', defaultMessage: '建议预售数量'})}
                  />
                )}
              </FormItem>
            </>
          }

          return (
            <Checkbox checked={advanceSale} onChange={this.setAdvanceSale.bind(this, goods.id)}>
              {formatMessage({ id: 'InStorage.advanceSale', defaultMessage: '预售商品' })}
            </Checkbox>
          )
        },
      },
    ]

    const tableConfig = {
      scroll: {
        x: 1450,
        y: 1,
      },
      className: 'purchase-table',
      columns: columns,
      dataSource: this.state.selectedGoods,
      // pagination: {
      //   size: 'small',
      //   pageSize: this.state.selectedGoods.length,
      // },
      pagination: false,
    }

    // const totalSumPrice = this.state.totalSelectedGoods
    //   .map((item: ListsUser) => item.price * item.quantity)
    //   .filter((item: number) => !Number.isNaN(item))

    return (
      <div className="PO-in-storage">
        <article className="supplier">
          <Form className="in-storage-brief-info">
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
                    {this.state.totalQty}
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
                    {this.state.supplierName}
                  </div>
                </FormItem>
                <FormItem
                  {...viewGoodsInfoFormLayout}
                  label={<FormattedMessage id={'AddNewPO.purchaseSumPrice'}/>}
                  className="po-supplier-detail po-view"
                >
                  <div className="po-supplier-code price" >
                    <b className="price">
                      {this.state.totalAmount}
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
          </Form>
        </article>

        <article className="instorage-goods">
          <div className="instorage-goods-header">
            <div className="instorage-add-goods">
              <h3>{formatMessage({ id: 'InStorage.inStorageList', defaultMessage: '入库商品清单' })}</h3>
            </div>
            <Search
              style={{width: 200}}
              placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
              enterButton={true}
              onSearch={this.filterByName}
            />
          </div>

          <Form className="PO-in-storage" onSubmit={this.submitFormData}>
            <Table {...tableConfig} />
          </Form>
        </article>

        <div className="operation-button">
          <Button
            type="primary"
            disabled={this.state.saveButtonLoading}
            loading={this.state.saveButtonLoading}
            onClick={this.submitFormData}
          >
          {formatMessage({ id: 'InStorage.confirmIn', defaultMessage: '确认入库' })}
          </Button>
          <Button>
            <Link to={pagesRouter.PurchaseOrderList}>
            {formatMessage({ id: 'InStorage.cancel', defaultMessage: '取消' })}
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}

const AddNewPO = Form.create<{}>()(AddNewPOForm)

export default injectIntl(AddNewPO)
