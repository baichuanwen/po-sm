/**
 * Created by zhiyang on 2017/8/17.
 * 2017-12-13 重构
 */
import * as React from 'react'
import { Select, Modal, Input, Button, Form, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ModalProps } from 'antd/lib/modal/Modal'

import { adminAxios, hasErrors } from '@Utilities'

const FormItem = Form.Item
const Option = Select.Option

interface UpdateExpressProps {
  orderItemId: number
  visible: boolean
  onCancel: () => void
  forceUpdateData: () => void
}

class UpdateExpress extends React.Component<FormComponentProps & ModalProps & UpdateExpressProps> {
  state = {
    loading: false,
    companies: [
      {'code': 'yunda', 'id': 1, 'name': '韵达快递'},
      {'code': 'huitongkuaidi', 'id': 2, 'name': '百世快递'},
      {'code': 'zhongtong', 'id': 3, 'name': '安能物流'},
      {'code': 'zhongtong', 'id': 4, 'name': '中通快递'},
      {'code': 'shentong', 'id': 5, 'name': '申通快递'},
      {'code': 'shunfeng', 'id': 6, 'name': '顺丰速运'},
      {'code': 'yuantong', 'id': 7, 'name': '圆通速递'},
      {'code': 'debangwuliu', 'id': 8, 'name': '德邦物流'},
      {'code': 'ziti', 'id': 9, 'name': '自提'},
      {'code': 'tiantian', 'id': 10, 'name': '天天快递'},
      {'code': 'jd', 'id': 11, 'name': '京东物流'}
    ]
  }
  getFormItemValue = (key: string) => {
    const { getFieldsValue } = this.props.form
    const val = getFieldsValue([key])
    if (val) {
      return val[key]
    } else {
      return ''
    }
  }
  validateDeliveryNo = (rule: string, value = '', callback: any) => {
    value = value.trim()
    if (value) {
      if (value.length > 300) {
        return callback('快递单号过长')
      }
      const check = /^([0-9a-zA-Z]+|([0-9a-zA-Z]+;))+$/.test(value)
      if (check) {
        return null
      }
      return callback('请填写正确的快递单号')
    }
    return callback('快递单号不为空')
  }
  handleSubmit = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const {
      orderItemId,
      onCancel,
      forceUpdateData,
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
        resetFields,
      },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error('表单填写有误，请仔细检查表单')
    }

    const values: any = getFieldsValue()
    let { company, deliveryNo } = values
    // 物流选择 自提 时，没有快递单号。设置一个默认的快递单号
    if (!deliveryNo) {
      deliveryNo = '12345'
    }
    this.setState({loading: true})
    const params = `deliveryNo=${deliveryNo.replace(/\s/g, '')}&company=${company}`
    return adminAxios.put(`/order/delivery/item/${orderItemId}?${params}`).then(res => {
      message.success('更新物流信息成功')
      resetFields()
      this.setState({loading: false}, () => {
        onCancel() // 关闭弹出层
        forceUpdateData() // 让父元素重新获取数据
      })
    }).catch(err => {
      this.setState({loading: false})
    })
  }

  render () {
    const { loading, companies } = this.state
    const {
      visible,
      onCancel,
      form: { getFieldDecorator }
    } = this.props
    return (
      <Modal
        title="填写物流信息"
        // okText="确定"
        footer={null}
        visible={visible}
        onCancel={onCancel}
      >
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FormItem label="物流公司">
            {getFieldDecorator('company', {
              rules: [{ required: true, message: '请选择物流公司!' }]
            })(
              <Select
                mode="combobox"
                placeholder="请选择物流公司"
                defaultActiveFirstOption={false}
                filterOption={false}
              >
                {
                  companies.map(company => (<Option key={company.id} value={company.name}>
                    {company.name}
                  </Option>))
                }
              </Select>
            )}
          </FormItem>
          {
            this.getFormItemValue('company') !== '自提'
            ? <FormItem label="请填写快递单号 (多个单号以英文分号区分;首尾不加分号) ">
                {getFieldDecorator('deliveryNo', {
                  rules: [{
                    required: true,
                    validator: this.validateDeliveryNo
                  }]
                })(
                  <Input/>
                )}
              </FormItem>
            : null
          }
          <FormItem>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(UpdateExpress)
