/**
 * Created by zhiyang on 2017/12/14.
 */
import * as React from 'react'
import { Button, Form, Input, InputNumber, Select, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'

import QiniuUpload from '@Components/QiniuUpload'
import { adminAxios } from '@Utilities'

const FormItem = Form.Item
const Option = Select.Option

interface OrderPayProps {
  orderId: number | string
  payAmount: number
  forceUpdateData: () => void
}

class OrderPay extends React.Component<FormComponentProps & OrderPayProps> {
  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const { form, orderId, forceUpdateData } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        adminAxios.put(`/order/${orderId}/payInfo`, values).then(res => {
          message.success('填写订单支付成功')
          if (forceUpdateData) {
            forceUpdateData()
          }
        })
      }
    })
  }

  render () {
    const {form, payAmount} = this.props
    const {getFieldDecorator} = form
    const formItemLayout = {
      labelCol: {
        sm: {span: 2}
      },
      wrapperCol: {
        sm: {span: 10}
      }
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <h2 style={{padding: '8px 0'}}>填写订单支付信息</h2>
        <FormItem label="支付方式" {...formItemLayout}>
          {getFieldDecorator('payType', {
            rules: [
              { required: true, message: '请输入备注信息' }
            ]
          })(
            <Select style={{width: 120}}>
              <Option value="0">微信支付</Option>
              <Option value="1">支付宝支付</Option>
              <Option value="2">银联转账</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="实付金额"
          extra={<p>系统通过实际售价*数量计算出金额是: {payAmount} 元</p>}
          {...formItemLayout}
        >
          {getFieldDecorator('payAmount', {
            rules: [{
              required: true,
              message: '请输入实付金额'
            }],
            initialValue: payAmount
          })(
            <InputNumber min={0.01} />
          )}
        </FormItem>
        <FormItem label="付款凭证" {...formItemLayout}>
          {getFieldDecorator('images', {
            initialValue: [],
            rules: [
              { required: true, message: '请上传付款凭证', }
            ],
          })(
            <QiniuUpload count={9}/>
          )}
        </FormItem>
        <FormItem label="备注信息"
                  {...formItemLayout}>
          {getFieldDecorator('remark', {
            rules: [
              { required: true, message: '请输入备注信息' }
            ]
          })(
            <Input maxLength={100} autoComplete="off" />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">确认提交</Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(OrderPay)
