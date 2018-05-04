import * as React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Form, Button, Input, Table, InputNumber, message, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'
import * as moment from 'moment'

import { axios, getPicSrc, hasErrors, initTableScroll, pagesRouter, asyncComponent, history } from '@Utilities'
import './index.less'

let uuid = 1
const AddGoodsModal = asyncComponent(() => import(
  /* webpackChunkName: "AddGoodsModal" */'../../components/AddGoodsModal'
))

const FormItem = Form.Item
const { TextArea } = Input

interface NewState {
  addSupplierModalVisible?: boolean
  addGoodsModalVisible?: boolean
  confirmButtonLoading?: boolean
  warehouseId?: number | string
  remark?: string
  Warehouse?: Warehouse[]
  outWarehouseNo?: string
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
  weight: number
  skuId: string | number
  // loading?: boolean
  // pagination?: boolean
}

interface Warehouse {
  id?: number
  name?: string
  cnName?: string
  enName?: string
}

class AddNewOutboundForm extends React.Component<
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
    outboundId: undefined,
    outWarehouseNo: '',
    createTime: '',

    selectedGoods: [],

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
    const outboundId = idList[1]

    /**
     * 判断当前的路由是否是编辑状态
     * 如果是，请求任务添加获取 PO detail的接口
     */
    let requestTasks = [
      axios.get('/warehouse'),
    ]
    if (search.includes('outboundid')) {
      requestTasks = [
        axios.get('/warehouse'),
        axios.get(`/warehouse/out/${outboundId}`)
      ]
    }

    Promise.all(requestTasks).then(res => {
      const { data } = res[0].data

      /**
       * 初始化 outbound Detail
       * 当路由包含 outboundId
       * 获取接口数据，初始化 PO单详情
       */
      let PODetail = {
        remark: '',
        selectedGoods: [],
        outWarehouseNo: '',
        weight: 0,
        createTime: '',
      }
      if (search.includes('outboundid')) {
        const { outWarehouseNo, remark, items, weight, createTime } = res[1].data.data
        PODetail = {
          outWarehouseNo,
          remark,
          weight,
          createTime: moment(createTime).format('YYYY-MM-DD HH:mm:ss'),
          selectedGoods: items.map((item: ListsUser) => ({
            ...item,
            key: item.skuId || item.id,
            name: locale === 'zh' ? item.cnName : item.enName,
            outboundNumber: item.quantity,
          }))
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

        outboundid: outboundId,
        ...PODetail,
      })
    })
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
   * 更新被选中的 goods lists
   */
  updateSelectGoodsKeys = (selectGoods: ListsUser[]) => {
    this.setState({
      addGoodsModalVisible: false,
      selectedGoods: selectGoods.filter(item => item.quantity > 0)
    })
  }

  /**
   * 删除对应的 goods
   */
  deleteGoods = (key: number) => {
    /**
     * 如果当前为编辑页面
     * 调用接口，删除 PO单中的具体商品
     */
    return this.setState({
      selectedGoods: this.state.selectedGoods.filter((item: ListsUser) => item.key !== key)
    })
  }

  /**
   * 局部更新 price and quantity
   */
  updateDetailPriceAndQuantity = (type: string, key: number, value: number) => {
    // console.log(type)
    // console.log(key)
    // console.log(value)

    const newSelectedGoods = this.state.selectedGoods.map((item: ListsUser) => {
      if (item.key === key) {
        return {
          ...item,
          [type]: value,
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
    const items = this.state.selectedGoods.map((item: ListsUser) => ({
      quantity: item.outboundNumber,
      skuId: item.skuId
    }))

    if (items.length === 0) {
      return message.error(
        formatMessage({
          id: 'AddNewOutbound.skuSelectReqiured',
          defaultMessage: '请至少选择一个商品'
        })
      )
    }

    const params = {
      items,
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
    this.setState({ saveButtonLoading: true })

    /**
     * 出库单创建
     */
    axios.post(`/warehouse/${this.state.warehouseId}/out`, params).then(res => {
      const { data } = res
      this.setState({ saveButtonLoading: false })
      if (data.code === 0) {
        message.success(
          formatMessage({
            id: 'AddNewOutbound.createSuccess',
            defaultMessage: '出库单创建成功'
          })
        )
        setTimeout(() => history.push(pagesRouter.WarehouseOutboundlist), 800)
      }

      if (data.code === 40002) {
        message.warning(
          formatMessage({
            id: 'AddNewOutbound.quantityUpdate',
            defaultMessage: '商品数量发生变化, 库存不足'
          })
        )

        const { data: goodsData } = data

        this.setState({
          selectedGoods: this.state.selectedGoods.map((item: ListsUser) => ({
            ...item,
            quantity: goodsData[item.skuId] ? goodsData[item.skuId] : item.quantity
          }))
        })
      }
    }).catch(() => { this.setState({ saveButtonLoading: false }) })
  }

  render () {
    const {
      form: {
        getFieldDecorator,
      },
      intl,
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
        title: formatMessage({ id: 'AddNewOutbound.goods', defaultMessage: '商品'}),
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
        title: formatMessage({ id: 'AddNewOutbound.skuName', defaultMessage: '商品规格'}),
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
        key: 'barCode',
        title: formatMessage({ id: 'AddNewOutbound.skuCode', defaultMessage: 'SKU 编码'}),
        dataIndex: 'barCode',
        width: 150,
      },
      {
        key: 'quantity',
        title: formatMessage({
          id: !pathname.includes('view')
            ? 'AddNewOutbound.quantity'
            : 'AddNewOutbound.outboundNumber',
          defaultMessage: '库存量'
        }),
        dataIndex: 'quantity',
        width: 150,
      },
    ]

    const Operation: ColumnProps<ListsUser>[] = [
      {
        key: 'outboundNumber',
        title: formatMessage({ id: 'AddNewOutbound.outboundNumber', defaultMessage: '出库数量'}),
        dataIndex: 'outboundNumber',
        width: 200,
        render: (outboundNumber, goods) => {
          if (pathname.includes('view')) {
            return <span>{outboundNumber}</span>
          } else {
            return (
              <FormItem className="po-supplier-detail">
                {getFieldDecorator(`${goods.key}${outboundNumber}outboundNumber`, {
                  initialValue: outboundNumber,
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'AddNewOutbound.quantityReqiured', defaultMessage: '请输入数量' })
                    }
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={goods.quantity}
                    style={{width: 110}}
                    onChange={this.updateDetailPriceAndQuantity.bind(this, 'outboundNumber', goods.key)}
                    placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入'})}
                  />
                )}
              </FormItem>
            )
          }
        },
      },
      {
        key: 'operation',
        title: formatMessage({ id: 'AddNewOutbound.operation', defaultMessage: '操作'}),
        dataIndex: 'operation',
        width: 150,
        // fixed: 'right',
        className: 'operation',
        render: (operation, goods) => (
          <a onClick={this.deleteGoods.bind(this, goods.key)}>
          {formatMessage({ id: 'AddNewOutbound.delete', defaultMessage: '删除'})}
          </a>
        )
      }
    ]

    const tableConfig = {
      scroll: {
        x: 1100,
        y: 1,
      },
      className: 'purchase-table',
      columns: !pathname.includes('view') ? columns.concat(Operation) : columns,
      dataSource: this.state.selectedGoods,
      pagination: false,
      // pagination: {
      //   size: 'small',
      //   pageSizeOptions: [`${this.state.selectedGoods.length}`],
      // },
    }

    const totalSumWeight = this.state.selectedGoods
      .map((item: ListsUser) => item.weight * item.outboundNumber)
      .filter((item: number) => !Number.isNaN(item))

    const totalSumQuantity = this.state.selectedGoods
      .map((item: ListsUser) => item.outboundNumber)
      .filter((item: number) => !Number.isNaN(item) && item !== undefined)

    const goodsModalConfig = {
      // supplierId: -1,
      status: 'outbound',
      warehouse: this.state.warehouse,
      warehouseId: this.state.warehouseId,
      className: 'add-goods-modal',
      intl: intl,
      visible: this.state.addGoodsModalVisible,
      closeGoodsModal: this.closeGoodsModal,
      selectedGoods: this.state.selectedGoods,
      updateSelectGoodsKeys: this.updateSelectGoodsKeys,
    }

    return (
      <Form className="add-new-outbound" onSubmit={this.submitFormData}>
        { this.state.addGoodsModalVisible &&
          <AddGoodsModal key={`goods${uuid++}`} {...goodsModalConfig}/>
        }
        {pathname.includes('view') &&
          <Button className="backto-pre">
            <Icon type="rollback" />
            <Link to={pagesRouter.WarehouseOutboundlist}>
            {formatMessage({ id: 'AddNewOutbound.backtoPre', defaultMessage: '返回上一页' })}
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
                    label={<FormattedMessage id={'AddNewOutbound.outWarehouseNo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code">{this.state.outWarehouseNo}</div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewOutbound.purchaseSumQuantity'}/>}
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
                    label={<FormattedMessage id={'AddNewOutbound.remark'}/>}
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
                    label={<FormattedMessage id={'AddNewOutbound.outboundTime'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.createTime}
                    </div>
                  </FormItem>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewOutbound.goodsWeight'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code price" >
                      <b className="price">
                        {totalSumWeight.length > 0
                          ? (totalSumWeight.reduce((pre: number, next: number) => pre + next) / 1000)
                          : 0
                        }
                      </b>
                    </div>
                  </FormItem>
                </Col>
                <Col className="select-supplier view-supplier" {...viewColLayout}>
                  <FormItem
                    {...viewGoodsInfoFormLayout}
                    label={<FormattedMessage id={'AddNewOutbound.Repo'}/>}
                    className="po-supplier-detail po-view"
                  >
                    <div className="po-supplier-code" >
                      {this.state.warehouse}
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
              <h3>{formatMessage({ id: 'AddNewOutbound.outboundGoods', defaultMessage: '出库商品清单' })}</h3>
              {!pathname.includes('view') &&
                <Button type="primary" onClick={this.addGoods}>
                {formatMessage({ id: 'AddNewOutbound.addGoods', defaultMessage: '添加商品' })}
                </Button>
              }
            </div>
            {!pathname.includes('view') &&
              <div className="purchase-goods-sum">
                <span>
                {formatMessage({ id: 'AddNewOutbound.Repo', defaultMessage: '所属仓库' })}:
                <b className="price">{this.state.warehouse}</b>
                </span>
                <span>
                {formatMessage({ id: 'AddNewOutbound.purchaseSumQuantity', defaultMessage: '采购总数' })}:
                <b className="price">
                  {totalSumQuantity.length > 0
                    ? totalSumQuantity.reduce((pre: number, next: number) => pre + next)
                    : 0
                  }
                </b>
                </span>
                <span>
                {formatMessage({ id: 'AddNewOutbound.goodsWeight', defaultMessage: '商品毛重' })}:
                <b className="price">
                {totalSumWeight.length > 0
                  ? totalSumWeight.reduce((pre: number, next: number) => pre + next) / 1000
                  : 0
                }
                </b>
                </span>
              </div>
            }
          </div>

          <Table {...tableConfig} />
        </article>

        {!pathname.includes('view') &&
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
            {formatMessage({ id: 'AddNewOutbound.save', defaultMessage: '保存' })}
            </Button>
            <Button>
              <Link to={pagesRouter.WarehouseOutboundlist}>
                {formatMessage({ id: 'AddNewOutbound.cancel', defaultMessage: '取消' })}
              </Link>
            </Button>
          </div>
        }
      </Form>
    )
  }
}

const AddNewOutbound = Form.create<{}>()(AddNewOutboundForm)

export default injectIntl(AddNewOutbound)
