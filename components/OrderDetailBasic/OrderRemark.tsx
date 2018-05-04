import * as React from 'react'
import { Button, Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { adminAxios, hasErrors } from '@Utilities'

const FormItem = Form.Item
const { TextArea } = Input

interface OrderRemarkProps {
  orderId: number | string
  orderRemark?: string
}

class OrderRemark extends React.Component<OrderRemarkProps & FormComponentProps> {

  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      orderId,
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    const values: any = getFieldsValue()
    return adminAxios.put(`/order/remark/${orderId}?remark=${values.remark}`).then(res => {
      message.success('修改备注成功')
    })
    // form.validateFields((err: any, values: any) => {
    //   adminAxios.put(`/order/remark/${orderId}?remark=${values.remark}`).then(res => {
    //     message.success('修改备注成功')
    //   })
    // })
  }

  render () {
    const { form, orderRemark } = this.props
    const { getFieldDecorator } = form
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label="备注订单">
          {getFieldDecorator('remark', {
            initialValue: orderRemark || '',
            rules: [
              {
                required: true,
                pattern: /\S+/,
                message: '请输入备注信息',
              }
            ],
          })(
            <TextArea maxLength={100} style={{width: 450}} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">备注</Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(OrderRemark)
