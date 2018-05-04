import * as React from 'react'
import { Form, Input, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import AddressPicker from './AddressPicker'
import Cart from './Cart'

import { adminAxios, history, pagesRouter, hasErrors } from '@Utilities'
import { ProductsProps } from './index.d'

const FormItem = Form.Item

class CreateManualOrder extends React.Component<FormComponentProps> {
  state = {
    loading: false
  }
  checkCartData = (rule: string, value: any, callback: (err: string | undefined) => void) => {
    if (value && value.length) {
      let err
      const flag = value.every(({price, quantity}: ProductsProps) => price && quantity)
      if (!flag) {
        err = '请填写正确的价格或者数量'
      }
      return callback(err)
    }
    return callback('请选择商品或者填写正确的价格或者数量')
  }
  checkAddressData = (rule: string, value: string[], callback: (err: string | undefined) => void) => {
    let err
    const flag = Object.keys(value).every(key => value[key] && value[key].trim() !== '')
    if (!flag) {
      err = '请填写正确的地址'
    }
    callback(err)
  }
  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()

    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    const values: any = getFieldsValue()
    const { nickname, name, tel, orderBuyParams, addr } = values
    const data = {
      source: 4, // 订单时手动创建的
      delivery: {
        name,
        tel,
        ...addr,
      },
      nickname,
      orderBuyParams
    }

    this.setState({ loading: true })
    return adminAxios.post('/order', data).then(res => {
      message.success('创建订单成功')
      setTimeout(() => {
        history.push(pagesRouter.ManualOrderList)
      }, 500)
    }).catch(() => {
      this.setState({loading: false})
    })
  }

  render () {
    const formItemLayout = {
      labelCol: {
        sm: {span: 3}
      },
      wrapperCol: {
        sm: {span: 10}
      }
    }
    const wideFormItemLayout = {
      labelCol: {
        sm: {span: 3}
      },
      wrapperCol: {
        sm: {span: 18}
      }
    }
    const {getFieldDecorator} = this.props.form
    return (
      <Form onSubmit={this.handleSubmit}>
        <h4 className="block-title">商品信息</h4>
        <FormItem label="购买用户" {...formItemLayout}>
          {getFieldDecorator('nickname', {
            // initialValue: '',
            rules: [
              {
                required: true,
                max: 20,
                message: '请填写正确的商品名称'
              }
            ]
          })(
            <Input/>
          )}
        </FormItem>
        <FormItem required label="订单来源" {...formItemLayout}>
          <Input value="手动创建订单" disabled/>
        </FormItem>
        <FormItem label="收件人姓名" {...formItemLayout}>
          {getFieldDecorator('name', {
            // initialValue: '',
            rules: [{
              required: true,
              max: 20,
              message: '请填写正确的收件人姓名'
            }]
          })(
            <Input />
          )}
        </FormItem>
        <FormItem label="手机号码" {...formItemLayout}>
          {getFieldDecorator('tel', {
            // initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{
              required: true,
              pattern: /^1[3578]\d{9}$/,
              message: '请填写正确的手机号码'
            }]
          })(
            <Input/>
          )}
        </FormItem>
        <FormItem label="收货地址" {...wideFormItemLayout}>
          {getFieldDecorator('addr', {
            initialValue: ['','','',''],
            validateTrigger: 'onBlur',
            rules: [{
              required: true,
              validator: this.checkAddressData
            }]
          })(
            <AddressPicker />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('orderBuyParams', {
            initialValue: [],
            validateTrigger: 'onBlur',
            rules: [{
              validator: this.checkCartData
            }]
          })(
            <Cart/>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" loading={this.state.loading}>
            保存
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(CreateManualOrder)
