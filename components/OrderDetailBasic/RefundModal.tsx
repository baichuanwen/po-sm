/**
 * Created by zhiyang on 2017/10/12.
 */
import * as React from 'react'
import { Form, Modal, InputNumber, Button, Input, Alert, Select, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ModalProps } from 'antd/lib/modal/Modal'

import { adminAxios, hasErrors } from '@Utilities'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

interface RefundModalProps extends ModalProps {
  visible: boolean
  refundItemId: number | undefined
  forceUpdateData: () => void
  handleRefundModalClose: () => void
}

class RefundModal extends React.Component<FormComponentProps & RefundModalProps> {
  state = {
    loading: false,
    inventoryUpdateType: 'add',
    orderItemData: {
      quantity: 1,
      price: 0,
      amount: 0.01,
      productName: '',
    },
  }
  // 校验数量
  validateQuantity = (rule: string, value: number, callback: (err: string | undefined) => void) => {
    if (value >= 1 && value <= this.state.orderItemData.quantity) {
      return null
    }
    return callback('请填写正确的数量')
  }
  // 校验总价
  validateAmount = (rule: string, value: number, callback: (err: string | undefined) => void) => {
    // 注意: 退款金额可以为 0
    if (value >= 0 && value <= this.state.orderItemData.amount) {
      return null
    }
    return callback('请填写正确的退款金额')
  }
  validateInventoryUpdate = (rule: string, value: number, callback: (err: string | undefined) => void) => {
    const quantity = this.props.form.getFieldValue('quantity')
    if (quantity) {
      if (Math.abs(value) <= quantity) {
        return null
      }
      return callback('请填写正确的回滚数量')
    }
  }
  handleQuantityChange = (value: number) => {
    if (value) {
      this.props.form.setFieldsValue({
        refundAmount: value * this.state.orderItemData.price
      })
    }
  }
  handleTypeChange = (value: string) => {
    this.setState({inventoryUpdateType: value})
  }
  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      refundItemId,
      handleRefundModalClose,
      forceUpdateData,
    } = this.props
    const { inventoryUpdateType } = this.state

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    const values: any = getFieldsValue()
    values.refundDesc = values.refundDesc.trim()
    if (inventoryUpdateType === 'minus') {
      values.inventoryUpdateCnt = -1 * values.inventoryUpdateCnt
    }

    if (inventoryUpdateType === 'none') {
      values.inventoryUpdateCnt = 0
    }

    this.setState({ loading: true })

    return adminAxios.post('/refund', {
      ...values,
      orderItemId: refundItemId
    }).then(res => {
      message.success('退款成功')
      this.setState({ loading: false })
      handleRefundModalClose()

      if (forceUpdateData) {
        forceUpdateData()
      }
    }).catch(err => {
      this.setState({ loading: false })
    })
  }

  componentWillReceiveProps (nextProps: ModalProps & FormComponentProps & RefundModalProps) {
    const { form } = this.props
    const { refundItemId, visible } = nextProps
    // 当弹出层由隐藏到显示时，获取数据
    if (visible && !this.props.visible) {
      adminAxios.get(`/refund/orderItem/${refundItemId}`).then(res => {
        this.setState({ orderItemData: res.data.data })
      })
    }
    // 关闭弹框时 重置表单
    if (!visible) {
      form.resetFields()
    }
  }

  render () {
    const { orderItemData, loading, inventoryUpdateType } = this.state
    const {
      visible,
      handleRefundModalClose,
      form: {
        getFieldDecorator,
        getFieldValue,
      },
    } = this.props
    const quantity = getFieldValue('quantity')
    const formItemLayout = {
      labelCol: {
        sm: { span: 4 }
      },
      wrapperCol: {
        sm: { span: 18 }
      },
    }
    return (
      <Modal
        visible={visible}
        title='退款操作'
        footer={null}
        onCancel={handleRefundModalClose}
      >
        <Form onSubmit={this.handleSubmit}>
          <Alert
            message={`1.退款前请确认微信或支付宝账户有足够余额，否则无法退款，若余额不足请充值后再打款
                      2.请注意该订单的优惠金额,退款金额应相应减去优惠金额`}
            type='error'
          />
          <FormItem label="商品名称" {...formItemLayout}>
            <p>{orderItemData.productName}</p>
          </FormItem>
          <FormItem
            label="退款数量"
            extra={`最大${orderItemData.quantity}件`}
            {...formItemLayout}
          >
            {getFieldDecorator('quantity', {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity
                }
              ]
            })(
              <InputNumber
                parser={(value: string) => Number(value.replace(/\..*/g, ''))}
                min={1}
                onChange={this.handleQuantityChange}
              />
            )}
          </FormItem>
          <FormItem
            label="退款金额"
            extra={`最多${orderItemData.amount}元`}
            {...formItemLayout}
          >
            {getFieldDecorator('refundAmount', {
              rules: [
                {
                  required: true,
                  validator: this.validateAmount
                }
              ]
            })(
              <InputNumber />
            )}
          </FormItem>
          <FormItem
            label="库存变化"
            required
            extra={ quantity ? `最大回滚数量是: ${quantity}` : null}
            {...formItemLayout}
          >
            <Select style={{width: 100, marginRight: 10}} value={inventoryUpdateType} onChange={this.handleTypeChange}>
              <Option value="add">增加</Option>
              <Option value="minus">减少</Option>
              <Option value="none">不变</Option>
            </Select>
            {
              inventoryUpdateType !== 'none'
              ? getFieldDecorator('inventoryUpdateCnt', {
                  rules: [
                    { validator: this.validateInventoryUpdate }
                  ]
                })(
                  <InputNumber parser={(value: string) => Number(value.replace(/\..*/g, ''))} min={0} />
                )
              : null
            }
          </FormItem>
          <FormItem label="退款原因" {...formItemLayout}>
            {getFieldDecorator('refundDesc', {
              rules: [
                { required: true, message: '请填写退款原因' }
              ]
            })(
              <TextArea maxLength={16}/>
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Modal>)
  }
}

export default Form.create()(RefundModal)
