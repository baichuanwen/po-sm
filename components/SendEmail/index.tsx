import * as React from 'react'
import { Modal, Form, Input, Select, Radio, message } from 'antd'
import { ModalProps } from 'antd/lib/modal/Modal'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, hasErrors, pagesRouter, REGEXP, history } from '@Utilities'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
const { Option } = Select

interface NewModalProps extends ModalProps {
  // tslint:disable-next-line
  mailData: any
  POId: number | string
  closeSendEmailModal: () => {}
}

interface Receivers {
  email: string
  name: string
}

interface Templates {
  content: string
  id: number
  name: string
  subject: string
}

// interface formData {
// }

interface NewState {
  POId: undefined | number
  receivers: Receivers[]
  templates: Templates[]
  templateId: number
  content: string
  subject: string
  sendMailButton: boolean
  orderPdfPath: string
}

class SendEmailFrom extends React.Component<NewModalProps & FormComponentProps & InjectedIntlProps> {
  state: NewState = {
    POId: undefined,
    receivers: [],
    templates: [],
    templateId: 1,
    orderPdfPath: '',
    content: '',
    subject: '',
    sendMailButton: false,
  }

  // tslint:disable-next-line
  submitForm = (): any => {
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

    for ( let item of formData.receivers) {
      if (!item.match(REGEXP.email)) {
        return message.error(
          formatMessage({
            id: 'AddSupplierModal.emailFormat',
            defaultMessage: '表单填写有误，请仔细检查表单'
          })
        )
      }
    }

    this.setState({ sendMailButton: true })

    axios.post(`/purchase/${this.state.POId}/mail/send`, formData).then(res => {
      const { data } = res
      this.setState({ sendMailButton: false })
      if (data.code === 0) {
        message.success(
          formatMessage({
            id: 'SendEmailModal.sendSuccess',
            defaultMessage: '邮件发送成功'
          })
        )

        /**
         * 判断当前页面是否是编辑页面还是创建页面
         * 若是列表页，无需跳转页面，关闭 Modal
         * 若是创建 or 编辑页面，返回到列表页
         */
        const { location: { search } } = history
        if (!search.includes('warehouseid')) {
          this.props.closeSendEmailModal()
        } else {
          setTimeout(() => history.push(pagesRouter.PurchaseOrderList), 800)
        }
      }
    }).catch(() => this.setState({ sendMailButton: false }))
  }

  componentDidMount () {
    if (this.props.mailData) {
      const { mailData: { receivers, templates, id, orderPdfPath }} = this.props
      // console.log(data)
      this.setState({
        POId: id,
        receivers,
        templates,
        content: templates[0].content,
        subject: templates[0].subject,
        orderPdfPath: orderPdfPath,
      })
    }
  }

  render () {
    const {
      visible,
      form: {
        getFieldDecorator,
      },
      intl: { formatMessage },
    } = this.props

    const goodsInfoFormLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 20},
    }

    return (
      <Modal
        className="add-modal send-email"
        visible={visible}
        title={formatMessage({ id: 'SendEmailModal.sendEmail', defaultMessage: '发功邮件' })}
        okText={formatMessage({ id: 'SendEmailModal.send', defaultMessage: '发送' })}
        cancelText={formatMessage({ id: 'SendEmailModal.cancel', defaultMessage: '取消' })}
        confirmLoading={this.state.sendMailButton}
        onOk={this.submitForm}
        onCancel={this.props.closeSendEmailModal}
      >
        <Form onSubmit={this.submitForm}>
          {/* supplier info */}
          <FormItem
            wrapperCol={{offset: 3}}
            className="emailTemp"
          >
            <RadioGroup defaultValue={1}>
              {this.state.templates.map(item =>
                <Radio key={item.id} value={item.id}>{item.name}</Radio>
              )}
            </RadioGroup>
          </FormItem>

          <FormItem
            {...goodsInfoFormLayout}
            label={<FormattedMessage id="SendEmailModal.reciever" />}
            className="receiver"
          >
            {getFieldDecorator('receivers', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'SendEmailModal.receiverRequired', defaultMessage: '请填写收件人' }),
                },
              ],
            })(
              <Select
                mode="tags"
                tokenSeparators={[',']}
                placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
              >
              {this.state.receivers.map((item, index) =>
                <Option
                  key={`${item.name}${item.email}${index}`}
                  value={item.email}
                >
                {item.email}
                </Option>
              )}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...goodsInfoFormLayout}
            label={<FormattedMessage id="SendEmailModal.mainTopic" />}
            className="supplier-briefname"
          >
            {getFieldDecorator('subject', {
              initialValue: this.state.subject,
              validateTrigger: 'onBlur',
              rules: [],
            })(
              <Input
                placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
              />
            )}
          </FormItem>
          <FormItem
            {...goodsInfoFormLayout}
            label={<FormattedMessage id="SendEmailModal.content" />}
            className="content"
          >
            {getFieldDecorator('text', {
              initialValue: this.state.content,
              validateTrigger: 'onBlur',
              rules: [],
            })(
              <TextArea
                autosize={{minRows: 9}}
                placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
              />
            )}
          </FormItem>
          <FormItem
            labelCol={{span: 3}}
            wrapperCol={{span: 6}}
            label={<FormattedMessage id="SendEmailModal.annex" />}
            className="content"
          >
            {/* <Progress percent={30} size="small" /> */}
            <div>
              <a
                href={`/pms-static/purchase/pdf/${this.state.orderPdfPath}`}
                target="view_window"
              >
              {formatMessage({ id: 'SendEmailModal.preview', defaultMessage: '预览' })}
              </a>
            </div>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
const SendEmail = Form.create()(SendEmailFrom)
export default injectIntl(SendEmail)
