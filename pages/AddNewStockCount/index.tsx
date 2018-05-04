import * as React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Form, Button, Input, Table, message, InputNumber, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, getPicSrc, hasErrors, initTableScroll, pagesRouter, history } from '@Utilities'
import './index.less'

const FormItem = Form.Item
const { TextArea } = Input

interface NewState {
  addSupplierModalVisible?: boolean
  addGoodsModalVisible?: boolean
  confirmButtonLoading?: boolean
  warehouseId?: number | string
  remark?: string
  Warehouse?: Warehouse[]
  verificationNo?: string
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
  outboundNumber: number
  quantity: number
  inventory: number
  bookInventory: number
  actualTotal: number
  actualInventory: number
  weight: number
  skuId?: string | number
  loading?: boolean
  pagination?: boolean
}

interface Warehouse {
  id?: number
  name?: string
  cnName?: string
  enName?: string
}

class AddNewStockCountForm extends React.Component<
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

    remark: '',

    warehouseList: [],
    warehouse: '',
    warehouseId: -1,
    inventoryId: undefined,
    verificationNo: '',
    createTime: '',

    selectedGoods: [],

    verificationDetail: {
      status: 0,
      verificationNo: '',
      bookTotal: 0,
      actualTotal: 0,
      createTime: '',
      remark: '',
    },

    saveButtonLoading: false,
  }

  componentDidMount () {
    this.getCountList()
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
  getCountList = () => {
    const { intl: { locale, formatMessage } } = this.props
    const { location: { pathname, search } } = history

    /**
     * 获取当前的 id lists
     * 路由格式为 ?warehouseid=2&poid=2
     */
    const idList = search.split('=')
      .map((item: string) => item.split('&'))
      .reduce((pre: string[], next: string[]) => pre.concat(next))
      .filter((item: string, index: number) => index % 2 === 1)

    const warehouseId = idList[0]
    const inventoryId = idList[1]

    /**
     * 判断当前的路由是否是编辑状态
     * 如果是，请求任务添加获取 PO detail的接口
     */
    let requestTasks = [
      axios.get('/warehouse'),
      axios.get(`/verification/product?warehouseId=${warehouseId}`),
    ]
    if (search.includes('inventoryid')) {
      requestTasks = [
        axios.get('/warehouse'),
        axios.get(`/verification/${inventoryId}/item`),
        axios.get(`/verification/${inventoryId}`)
      ]
    }

    Promise.all(requestTasks).then(res => {
      const { data } = res[0].data

      /**
       * 初始化 outbound Detail
       * 当路由包含 inventoryId
       * 获取接口数据，初始化 PO单详情
       */
      let PODetail = {
        selectedGoods: [],
      }

      const {
        data: goodsData,
        // data: { list }
      } = res[1].data
      PODetail = {
        selectedGoods: (goodsData.list ? goodsData.list : goodsData).map((item: ListsUser) => ({
          ...item,
          key: item.skuId || item.id,
          name: locale === 'zh' ? item.cnName : item.enName,
          actualTotal: pathname.includes('inventory') ? undefined : item.actualInventory,
          // actualTotal: item.actualInventory,
        }))
      }

      let newVerificationDetail = this.state.verificationDetail
      if (!pathname.includes('create')) {
        const { createTime, remark } = res[2].data.data
        newVerificationDetail = {
          ...res[2].data.data,
          createTime: moment(createTime).format('YYYY-MM-DD HH:mm:ss'),
          remark: remark
            ? remark
            : formatMessage({ id: 'AddNewStockCount.noRemark', defaultMessage: '暂无' })
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

        verificationDetail: newVerificationDetail,
        inventoryId: inventoryId,
        ...PODetail,
      })
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
  submitFormData = (): any => {
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
    const inventoryVerificationItemBodySet = this.state.selectedGoods.map((item: ListsUser) => ({
      actualInventory: item.actualTotal,
      id: item.key
    }))

    const params = {
      inventoryVerificationItemBodySet,
      remark: formData.remark ? formData.remark : '',
    }

    this.createOrEditPO(params)
  }

  /**
   * create Or Edit PO
   */
  // tslint:disable-next-line
  createOrEditPO = (params: any) => {
    const {
      intl: { formatMessage }
    } = this.props
    const { location: { pathname } } = history
    this.setState({ saveButtonLoading: true })

    /**
     * 出库单创建
     */
    if (pathname.includes('inventory')) {
      axios.put(`/verification/${this.state.inventoryId}`, params ).then(res => {
        const { data } = res
        this.setState({ saveButtonLoading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'AddNewStockCount.inventorySuccess',
              defaultMessage: '盘点成功'
            })
          )
          setTimeout(() => history.push(pagesRouter.WarehouseCountlist), 800)
        }
      }).catch(() => { this.setState({ saveButtonLoading: false }) })
    } else {
      axios.post(`/verification/${this.state.warehouseId}`).then(res => {
        const { data } = res
        this.setState({ saveButtonLoading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'AddNewStockCount.createSuccess',
              defaultMessage: '盘点单创建成功'
            })
          )
          setTimeout(() => history.push(pagesRouter.WarehouseCountlist), 800)
        }
      }).catch(() => { this.setState({ saveButtonLoading: false }) })
    }
  }

  render () {
    const {
      form: {
        getFieldDecorator,
      },
      intl: { formatMessage }
    } = this.props

    const { location: { pathname } } = history

    const goodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 6, xl: 6},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 15},
    }
    const viewColLayout = {sm: 12, md: 12, lg: 8, xl: 8}
    const viewGoodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 9, xl: 9},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 15},
    }

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'name',
        title: formatMessage({ id: 'AddNewStockCount.goods', defaultMessage: '商品'}),
        dataIndex: 'name',
        width: 280,
        // fixed: 'left',
        className: 'name',
        render: (name, goods) => <>
          <img src={getPicSrc((goods.mainPic).split('|')[0])} alt=""/>
          <span>{name}</span>
        </>
      },
      {
        key: 'skuName',
        title: formatMessage({ id: 'AddNewStockCount.skuName', defaultMessage: '商品规格'}),
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
        key: 'purchaseNo',
        title: formatMessage({ id: 'AddNewStockCount.PONumber', defaultMessage: '采购单号'}),
        dataIndex: 'purchaseNo',
        width: 120,
      },
    ]

    const LocationNo: ColumnProps<ListsUser>[] = [
      {
        key: 'inventory',
        title: formatMessage({ id: 'AddNewStockCount.inventory', defaultMessage: '账面库存'}),
        dataIndex: 'inventory',
        width: 150,
      },
      {
        key: 'locationNo',
        title: formatMessage({ id: 'AddNewStockCount.locationNo', defaultMessage: '库位编码'}),
        dataIndex: 'locationNo',
        width: 150,
        render: (locationNo) => {
          if (locationNo) {
            return <span>{locationNo}</span>
          }
          return <span>{formatMessage({ id: 'AddNewStockCount.noLocationNo', defaultMessage: '暂无'})}</span>
        }
      },
    ]

    const Operation: ColumnProps<ListsUser>[] = [
      {
        key: 'bookInventory',
        title: formatMessage({ id: 'AddNewStockCount.inventory', defaultMessage: '账面库存'}),
        dataIndex: 'bookInventory',
        width: 150,
      },
      {
        key: 'actualTotal',
        title: formatMessage({ id: 'AddNewStockCount.actualTotal', defaultMessage: '实盘库存'}),
        dataIndex: 'actualTotal',
        width: 200,
        render: (actualTotal, goods) => {
          if (pathname.includes('view')) {
            return <span>{actualTotal}</span>
          } else {
            return (
              <FormItem className="po-supplier-detail">
                {getFieldDecorator(`${goods.id}${goods.bookInventory}actualTotal`, {
                  initialValue: actualTotal,
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'AddNewStockCount.quantityReqiured', defaultMessage: '请输入数量' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={1000000}
                    style={{width: 110}}
                    onChange={this.updateDetailPriceAndQuantity.bind(this, 'actualTotal', goods.id)}
                    placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
                  />
                )}
              </FormItem>
            )
          }
        },
      },
      {
        key: 'inventoryProfitAndLoss',
        title: formatMessage({ id: 'AddNewStockCount.inventoryProfitAndLoss', defaultMessage: '盘点盈亏'}),
        dataIndex: 'inventoryProfitAndLoss',
        width: 150,
        // fixed: 'right',
        className: 'inventory-profit-and-loss',
        render: (inventoryProfitAndLoss, goods) => {
          let className = ''
          let value = ''
          if (goods.actualTotal - goods.bookInventory > 0) {
            className = 'more'
            value = `+${goods.actualTotal - goods.bookInventory}`
          }
          if (goods.actualTotal - goods.bookInventory < 0) {
            className = 'less'
            value = `${goods.actualTotal - goods.bookInventory}`
          }
          if (this.state.verificationDetail.status === 0) {
            className = ''
            value = ''
          }
          return (
            <span key={value} className={className}>{value}</span>
          )
        }
      }
    ]

    const tableConfig = {
      scroll: {
        x: 1050,
        y: 1,
      },
      className: 'purchase-table',
      columns: pathname.includes('create')
        ? columns.concat(LocationNo)
        : columns.concat(Operation),
      dataSource: this.state.selectedGoods,
      pagination: false,
    }

    const totalSumWeight = this.state.selectedGoods
      .map((item: ListsUser) => item.inventory)
      .filter((item: number) => !Number.isNaN(item))

    return (
      <Form className="add-new-outbound" onSubmit={this.submitFormData}>
        {pathname.includes('view') &&
          <Button className="backto-pre">
            <Icon type="rollback" />
            <Link to={pagesRouter.WarehouseCountlist}>
            {formatMessage({ id: 'AddNewStockCount.backtoPre', defaultMessage: '返回上一页' })}
            </Link>
          </Button>
        }

        {pathname.includes('view') &&
          <article className="supplier">
            <section className="select-supplier basic-info">
              <Row>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.verificationNo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code">
                    {this.state.verificationDetail.verificationNo}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.bookTotal'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price">
                      {this.state.verificationDetail.bookTotal}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.remark'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.verificationDetail.remark}
                    </div>
                  </FormItem>
                </Col>

                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.inventoryTime'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.verificationDetail.createTime}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.actualTotal'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      <b className="price">
                      {this.state.verificationDetail.actualTotal}
                      </b>
                    </div>
                  </FormItem>
                </Col>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.status'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.verificationDetail.status === 0
                        ? formatMessage({ id: 'AddNewStockCount.notCounted', defaultMessage: '未盘点' })
                        : formatMessage({ id: 'AddNewStockCount.counted', defaultMessage: '已盘点' })
                      }
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </section>
          </article>
        }

        {pathname.includes('inventory') &&
          <article className="supplier">
            <section className="select-supplier">
              <Row>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.verificationNo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code">
                    {this.state.verificationDetail.verificationNo}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.bookTotal'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      <b className="price">
                      {this.state.verificationDetail.bookTotal}
                      </b>
                    </div>
                  </FormItem>
                </Col>

                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.Repo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code">
                    {this.state.warehouse}
                    </div>
                  </FormItem>
                </Col>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewStockCount.status'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      {this.state.verificationDetail.status === 0
                        ? formatMessage({ id: 'AddNewStockCount.notCounted', defaultMessage: '未盘点' })
                        : formatMessage({ id: 'AddNewStockCount.counted', defaultMessage: '已盘点' })
                      }
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </section>
          </article>
        }

        <article className="purchase-goods">
          <div className="purchase-goods-header goods-header">
            <div className="purchase-add-goods">
              <h3>{formatMessage({ id: 'AddNewStockCount.outboundGoods', defaultMessage: '出库商品清单' })}</h3>
            </div>

            {pathname.includes('create') &&
              <div className="purchase-goods-sum">
                <span>
                {formatMessage({ id: 'AddNewStockCount.Repo', defaultMessage: '所属仓库' })}:
                <b className="price">{this.state.warehouse}</b>
                </span>
                <span>
                {formatMessage({ id: 'AddNewStockCount.bookTotal', defaultMessage: '账面总数' })}:
                <b className="price">
                {totalSumWeight.length > 0
                  ? totalSumWeight.reduce((pre: number, next: number) => pre + next)
                  : 0
                }
                </b>
                </span>
              </div>
            }
          </div>

          <Table {...tableConfig} />
        </article>

        {pathname.includes('inventory') &&
          <article className="add-new-outbound-remark goods-remark">
            <h3>{formatMessage({ id: 'AddNewPO.remark', defaultMessage: '备注' })}</h3>
            <FormItem
              {...goodsInfoFormLayout}
              // label={<FormattedMessage id={'AddNewPO.remark'}/>}
              className="outbound-remark"
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
          </article>
        }

        {!pathname.includes('view') &&
          <div className="operation-button">
            <Button
              type="primary"
              onClick={this.submitFormData}
              disabled={this.state.saveButtonLoading}
              loading={this.state.saveButtonLoading}
            >
            {formatMessage({ id: 'AddNewStockCount.save', defaultMessage: '保存' })}
            </Button>
            <Button>
              <Link to={pagesRouter.WarehouseCountlist}>
                {formatMessage({ id: 'AddNewStockCount.cancel', defaultMessage: '取消' })}
              </Link>
            </Button>
          </div>
        }
      </Form>
    )
  }
}

const AddNewStockCount = Form.create<{}>()(AddNewStockCountForm)

export default injectIntl(AddNewStockCount)
