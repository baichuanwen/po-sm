import * as React from 'react'
// import { Link } from 'react-router-dom'
import { Form, Input, Radio, InputNumber, Checkbox, DatePicker, Button, Select, message, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import * as moment from 'moment'
import { Moment } from 'moment/moment.d'

import { adminAxios, history, hasErrors, pagesRouter, mainContentScroll } from '@Utilities'
// import QiniuUpload from '@Components/QiniuUpload'
import './index.less'
import SkuTable from './SkuTable'
import PushInfo from './PushInfo'

interface ProductProps {
  barCode?: string
  defaultSku?: boolean
  id: number
  image?: string
  inventory?: number
  name: string
  properties?: string
  purchasePrice?: number
  retailPrice?: number
  skuStatus?: number
}

interface SkuProps {
  id?: number
	inventory?: number
	memberPrice?: number
	point?: number
	price?: number
	productSku?: ProductProps
}

interface MemberLevelsProps {
  name: string
  level: number
}

interface MallProductProps {
  loading: boolean
  isEdit: boolean
  needPushInfo: boolean
  editAble: boolean
  product: any
  productId?: number
  prevProductId?: number

  memberLevels: MemberLevelsProps[]

  visible: boolean
  qrImgSrc: string
}

interface MallMessageBodyProps {
  messageType?: string | number
  pushAheadOfMinute?: string
  messageContent?: string
}

// interface ListsUser {
//   id?: number
// }
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option } = Select

class OnShelvesGoodsEdit extends React.Component<FormComponentProps> {
  state: MallProductProps = {
    loading: false,

    isEdit: false,
    needPushInfo: false, // 是否需要推送消息
    editAble: true,
    product: {},

    memberLevels: [
      { name: 'V0', level: 0 },
      { name: 'V1', level: 1 },
      { name: 'V2', level: 2 },
      { name: 'V3', level: 3 },
      { name: 'V4', level: 4 },
      { name: 'V5', level: 5 }
    ],

    visible: false, // 弹出层是否显示
    qrImgSrc: '',
  }

  // 检查商品描述标签
  checkShowTag = (rule: string, value: string, callback: (err: string | undefined) => void) => {
    let err = undefined
    if (value) {
      if (!(/^[^\s#]+(#[^\s#]+){0,2}$/.test(value) && value.replace(/#/g, '').length <= 12)) {
        err = '请输入正确的标签'
      }
    }
    callback(err)
  }

  checkSoldTime = (currentDate: Moment): boolean => {
    // 不能早于今天
    if (currentDate && currentDate <= moment().startOf('day')) {
      return true
    }

    // 不能晚于 4天以后
    // current date time reset 00:00:00
    const newCurrentDate = currentDate && moment(
      moment(currentDate).format('YYYY-MM-DD 00:00:00')
    )
    if (newCurrentDate >= moment().add(4, 'days')) {
      return true
    }

    // 不能早于上架时间
    const onShelfTime = this.getFormItemValue('immediateOnShelf')
      ? undefined
      : this.getFormItemValue('onShelfTime')
    if (currentDate < moment(onShelfTime)) {
      return true
    }
    return false
  }

  checkOnShelfTime = (currentDate: Moment): boolean => {
    // 不能早于今天
    if (currentDate && currentDate <= moment().startOf('day')) {
      return true
    }
    return false
  }

  checkOffShelfTime = (currentDate: Moment): boolean => {
    // 不能早于上架时间
    const onShelfTime = this.getFormItemValue('immediateOnShelf')
      ? undefined
      : this.getFormItemValue('onShelfTime')
    if (currentDate < moment(onShelfTime)) {
      return true
    }
    return false
  }

  checkPushInfo = (rule: string, value: MallMessageBodyProps, callback: (err: string | undefined) => void) => {
    let err = undefined
    const { messageType, pushAheadOfMinute, messageContent } = value
    if (!messageContent) {
      err = '请填写正确的推送信息'
    }
    if (messageType !== 1) {
      // 开售前推送
      if (this.getFormItemValue('immediateSold') && this.getFormItemValue('immediateOnShelf')) {
        err = '立即上架并且开售状态下，无法设置开售前推送消息'
      } else if (!pushAheadOfMinute) {
        err = '请选择推送时间'
      }
    }
    callback(err)
  }

  componentDidMount () {
    const { location: { pathname, search } } = history
    const id = search.split('?')[1].split('=')[1]
    const isEdit = pathname.includes('/edit')
    // console.log(isEdit)

    /**
     * 如果是已上架商品的编辑操作
     */
    this.setState({ isEdit: isEdit })
    if (isEdit) {
      adminAxios.get(`/mall/product/${id}`).then(res => {
        let {
          skus,
          product,
        } = res.data.data

        // const prevProductId = product.id
        let mallMessageBody: MallMessageBodyProps = {}
        let needPushInfo = false

        if (res.data.data.message) {
          needPushInfo = true
          // babel 生成代码可能存在问题。
          // 全局有一个 message了，这不要从 res 中直接取 message。
          const msg = res.data.data.message
          mallMessageBody = {
            messageType: msg.type,
            pushAheadOfMinute: msg.aheadOfMinute.toString(),
            messageContent: msg.content
          }
        }

        let productData = {
          ...res.data.data,
          hasSku: product.hasSku || false,
          skus: Array.isArray(skus) && skus.map((item: SkuProps) => ({
            ...item,
            skuId: item.productSku && item.productSku.id,
            name: item.productSku && item.productSku.name || '',
          })),
          mallMessageBody,
        }
        // console.log(productData)
        this.setState({
          needPushInfo,
          productId: id,
          product: productData,
          editAble: productData.status !== 1, // 已上架时字段无法编辑的
          prevProductId: product.id,
        })
      })
    } else {
      adminAxios.get(`/product/${id}`).then(res => {
        const {
          name,
          description,
          productSkus,
          hasSku,
        } = res.data.data
        const skus = productSkus.map(({ inventory, name, id, purchasePrice }: ProductProps) =>
          ({
            inventory,
            name,
            skuId: id,
            price: purchasePrice,
          }))
        this.setState({
          product: {
            name,
            description,
            skus,
            hasSku,
            ship: 0,
          },
          productId: id,
          prevProductId: id,
        })
      })
    }

    // 页面高度自适应
    mainContentScroll()
    addEventListener('resize', mainContentScroll)
  }

  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()

    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      // intl: { formatMessage },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    this.setState({loading: true})
    const formData = getFieldsValue()
    const { isEdit, productId } = this.state

    let promptStr = '上架成功'
    let reqUrl = '/mall/product/onShelf'

    if (isEdit) {
      promptStr = '更新成功'
      reqUrl = '/mall/product'
    }

    return adminAxios.put(`${reqUrl}/${productId}`, formData).then(res => {
      setTimeout(() => {
        history.push(pagesRouter.MallGoodsOnShelves)
      }, 500)
      message.success(promptStr)
    }).catch(err => {
      this.setState({ loading: false })
    })
  }

  getFormItemValue = (key: string): string => {
    const { getFieldsValue } = this.props.form
    const val = getFieldsValue([key])
    if (val) {
      return val[key]
    } else {
      return ''
    }
  }

  closeModal = () => {
    this.setState({ visible: false })
  }

  productPreview = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()

    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      // intl: { formatMessage },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    // console.log(this.state.prevProductId)

    this.setState({ loading: true })
    const data = getFieldsValue()

    return adminAxios.post(`/mall/product/preview/${this.state.prevProductId}`, data).then(res => {
      this.setState({
        visible: true,
        qrImgSrc: res.data.data,
        loading: false,
      })
    }).catch(() => { this.setState({ loading: false }) })
  }

  render () {
    const {
      form: {
        getFieldDecorator,
      }
    } = this.props

    const { product, editAble, needPushInfo, memberLevels, visible, qrImgSrc } = this.state

    const formItemLayout = {
      labelCol: {sm: {span: 3}},
      wrapperCol: {sm: {span: 10}}
    }

    return (
      <Form className="main-content goods-edit-or-update" onSubmit={this.handleSubmit}>
        {/*弹出层预览区域*/}
        <Modal
          title="扫描二维码预览"
          visible={visible}
          onCancel={this.closeModal}
          footer={null}>
          {
            qrImgSrc ? <img src={'data:image/jpg;base64,' + qrImgSrc} alt="二维码" width={150}/> : null
          }
        </Modal>

        <FormItem
          {...formItemLayout}
          label="商品名称"
        >
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: '请填写商品名称', },
              { max: 50, message: '商品名称长度不得大于50', },
              { min: 2, message: '商品名称长度不得小于2', }
            ],
            initialValue: product.name
          })(
            <Input />
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="商品描述"
        >
          {getFieldDecorator('description', {
            rules: [
              { required: false },
              { max: 15, message: '产品描述不得超过15字' },
            ],
            initialValue: product.description || ''
          })(
            <Input />
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label={product.hasSku ? 'sku属性' : '属性'}
        >
          {getFieldDecorator('skus', {
            initialValue: product.skus,
            rules: [
              {
                required: true,
                // validator: this.checkSkuTableData
              }
            ],
          })(
            <SkuTable
              hasSku={product.hasSku}
              disabled={!editAble}
            />
          )}
        </FormItem>

        {/* <FormItem
          {...formItemLayout}
          label="商品角标"
        >
          {getFieldDecorator('cornerMark', {
            initialValue: product.cornerMark ? [product.cornerMark] : [],
            // rules: [{required: false}]
          })(
            <QiniuUpload count={1}/>
          )}
        </FormItem> */}

        <FormItem
          {...formItemLayout}
          label="商品描述标签"
          extra="#号分割，最多三个标签，10字以内(不包括分割符)"
        >
          {getFieldDecorator('showTag', {
            initialValue: product.showTag ? product.showTag : '',
            validateTrigger: 'onBlur',
            rules: [{
              // required: false,
              // pattern: /^[^\s#]+(#[^\s#]+){0,2}$/,
              message: '',
              validator: this.checkShowTag,
            }]
          })(
            <Input/>
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="物流方式"
        >
          {getFieldDecorator('ship', {
            rules: [
              { required: true, message: '请选择物流方式', }
            ],
            initialValue: String(product.ship) || '0',
          })(
            <RadioGroup>
              <Radio value="0">快递</Radio>
              {/*<Radio value="1">自提</Radio>*/}
            </RadioGroup>
          )}
        </FormItem>

        <FormItem
          label="快递费用"
          {...formItemLayout}
        >
          {getFieldDecorator('freight', {
            rules: [
              { required: true, message: '请填写快递价格', },
            ],
            initialValue: product.freight || 0
          })(
            <InputNumber
              min={0}
              max={999}
              parser={(value: string): number => Number(value.replace(/\..*/g, ''))}
            />
          )}
        </FormItem>

        <FormItem
          label="满几件包邮"
          extra="(0表示不参与满免邮费)"
          {...formItemLayout}
        >
          {getFieldDecorator('freightFreeLimit', {
            initialValue: product.freightFreeLimit || 0
          })(
            <InputNumber
              min={0}
              max={999}
              parser={(value: string): number => Number(value.replace(/\..*/g, ''))}
            />
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="购买限制"
        >
          {getFieldDecorator('limitCnt', {
            rules: [{
              required: true, message: '请填写购买上限',
            }],
            initialValue: product.limitCnt || 0
          })(
            <InputNumber
              min={0}
              max={999}
              parser={(value: string): number => Number(value.replace(/\..*/g, ''))}
            />
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="等级限制">
          {getFieldDecorator('memberLevel', {
            initialValue: String(product.memberLevel ? product.memberLevel : 0)
          })(
            <Select style={{width: 120}}>
              {memberLevels.map(({ level, name }: { level: number, name: string }) => (
                <Option key={level} value={level.toString()}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>

        {
          editAble
          ? (
            <div>
              <FormItem
                {...formItemLayout}
                label="立即上架"
                required
              >
                {
                  getFieldDecorator('immediateOnShelf', {
                    rules: [{
                      required: true
                    }],
                    initialValue: product.immediateOnShelf
                  })(
                    <Checkbox disabled={!editAble}/>
                  )
                }
              </FormItem>
              {
                this.getFormItemValue('immediateOnShelf')
                ? null
                : (
                    <FormItem
                      {...formItemLayout}
                      label="上架时间"
                    >
                      {getFieldDecorator('onShelfTime', {
                        initialValue: product.onShelfTime,
                        rules: [
                          {
                            required: true,
                            message: '请选择上架时间',
                            // validator: this.checkOnShelfTime
                          }
                        ]
                      })(
                        <DatePicker
                          showTime
                          disabledDate={this.checkOnShelfTime}
                          disabled={!editAble}
                          format="YYYY-MM-DD HH:mm"
                          placeholder="上架时间"
                        />
                      )}
                    </FormItem>
                  )
              }
          </div>
          )
          : null
        }

        <FormItem
          {...formItemLayout}
          label="立即开售"
        >
          {
            getFieldDecorator('immediateSold', {
              valuePropName: 'checked',
              rules: [
                { required: true },
              ],
              initialValue: product.immediateSold || false
            })(
              <Checkbox disabled={!editAble}/>
            )
          }
        </FormItem>

        { this.getFormItemValue('immediateSold')
          ? null
          : (
              <FormItem
                {...formItemLayout}
                label="开售时间"
              >
              {getFieldDecorator('soldTime', {
                initialValue: product.soldTime ? moment(product.soldTime) : undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择开售时间',
                    // validator: this.checkSoldTime
                  }
                ]
              })(
                <DatePicker
                  showTime
                  disabledDate={this.checkSoldTime}
                  disabled={false}
                  format="YYYY-MM-DD HH:mm"
                  placeholder="开售时间"
                />
              )}
            </FormItem>
          )
        }

        <FormItem
          {...formItemLayout}
          label="上架前推送"
        >
          <div>
            是否需要推送消息
            <Checkbox
              onChange={(e: React.SyntheticEvent<HTMLElement>) => {
                this.setState({ needPushInfo: (e.target as HTMLInputElement).checked})
              }}
              value={needPushInfo}
              disabled={!editAble}
            />
          </div>
          { needPushInfo
            ? getFieldDecorator('mallMessageBody', {
                initialValue: product.mallMessageBody || {},
                // validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    validator: this.checkPushInfo
                  }
                ],
              })(
                <PushInfo disabled={!editAble}/>
              )
            : null
          }
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="下架时间"
        >
          {getFieldDecorator('offShelfTime', {
            initialValue: product.offShelfTime ? moment(product.offShelfTime) : undefined,
            rules: [
              {
                required: false,
                // validator: this.checkOffShelfTime
              }
            ]
          })(
            <DatePicker
              // showTime
              disabledDate={this.checkOffShelfTime}
              format="YYYY-MM-DD HH:mm"
              placeholder="下架时间"
            />
          )}
        </FormItem>

        <FormItem className="operation">
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.loading}
          >
            保存
          </Button>
          <Button
            type="primary"
            onClick={this.productPreview}
            loading={this.state.loading}
            style={{marginLeft: 20}}
          >
            预览
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(OnShelvesGoodsEdit)
