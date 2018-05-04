import * as React from 'react'
import { Modal, Form, Input, Row, Col, Icon, message } from 'antd'
import { ModalProps } from 'antd/lib/modal/Modal'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'

import { hasErrors, axios, REGEXP } from '@Utilities'
import './index.less'
const FormItem = Form.Item
const { TextArea } = Input

interface ContactInfo {
  key?: number | undefined
  id?: number
  contactName?: string | undefined
  email?: string | undefined
  shortName?: string
  tel?: number | undefined
  position?: number | undefined
  remark?: string
}

interface NewState {
  deleted?: boolean
  name?: string | undefined
  shortName?: string | undefined
  address?: string | undefined
  remark?: string | undefined
  contactList: ContactInfo[]
}

interface SupplierInfo {
  id?: number
  name?: string | undefined
  shortName?: string | undefined
  address?: string | undefined
  remark?: string | undefined
  contactList?: ContactInfo[]
}

interface NewModalProps extends ModalProps {
  status: string
  supplierId: number
  warehouseId: number | string
  modalVisible: boolean
  confirmButtonLoading: boolean
  supplierInfo: SupplierInfo
  closeSupllierModal: () => {}
  createOrEditSupplier: (params: SupplierInfo, id: number) => {}
}

class AddSupplierModalFrom extends React.Component<NewModalProps & FormComponentProps & InjectedIntlProps> {
  state: NewState = {
    name: undefined,
    shortName: undefined,
    address: undefined,
    remark: undefined,
    contactList: [{
      key: 0,
      id: -1,
      contactName: undefined,
      email: undefined,
      tel: undefined,
      position: undefined,
    }],
  }

  componentDidMount () {
    if (this.props.supplierId !== -1 && this.props.visible) {
      axios.get(`/supplier/${this.props.supplierId}`).then(res => {
        const {
          name,
          shortName,
          address,
          remark,
          contactList,
        } = res.data.data
        this.setState({
          name: name,
          shortName: shortName,
          address: address,
          remark: remark,
          contactList: contactList.map((item: ContactInfo) => ({...item, key: item.id})),
        })
      })
    }
  }

  // 关闭弹窗
  hideModal = () => {
    this.props.closeSupllierModal()
  }

  /**
   * delete contact
   */
  deleteContact = (key: number) => {
    const newContactLists = this.state.contactList.filter((item: ContactInfo) => item.key !== key)
    this.setState({ contactList: newContactLists })
  }

  /**
   * add contact
   * 找出 contactList中最大的 key值，依次不断向上 +1
   */
  addContact = () => {
    const maxKey = Math.max(...this.state.contactList.map((item: ContactInfo) => item.key || 0))
    const contactUnit: ContactInfo[] = [
      {
        key: maxKey + 1,
        email: undefined,
      }
    ]

    const newContactLists = this.state.contactList.concat(contactUnit)
    this.setState({ contactList: newContactLists })
  }

  /**
   * 提交表单
   */
  submitForm = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const {
      form: {
        getFieldsValue,
        getFieldsError,
        validateFieldsAndScroll,
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

    const formData: SupplierInfo = getFieldsValue()
    const newContactLists = this.state.contactList.map(item => ({
      // key: item.key,
      email: formData[`email${item.key}`],
      contactName: formData[`contactName${item.key}`] || '',
      tel: formData[`tel${item.key}`] || '',
      position: formData[`position${item.key}`] || '',
    }))

    const params = {
      name: formData.name,
      shortName: formData.shortName || '',
      address: formData.address || '',
      remark: formData.remark || '',
      contactList: newContactLists || '',
    }
    return this.props.createOrEditSupplier(params, this.props.supplierId)
  }

  render () {
    const {
      visible,
      confirmLoading,
      // supplierId,
      // warehouseId,
      status,
      form: {
        getFieldDecorator,
      },
      intl: { formatMessage },
    } =  this.props

    const goodsInfoFormLayout = {
      labelCol: {sm: 6, md: 6, lg: 6, xl: 8},
      wrapperCol: {sm: 16, md: 16, lg: 16, xl: 16},
    }
    const detailInfoCol = { sm: 24, md: 24, lg: 12, xl: 12 }

    return (
      <Modal
        // key={`${supplierId}Modal`}
        className="add-modal add-supplier"
        visible={visible}
        title={
          status === 'create'
          ? formatMessage({ id: 'AddSupplierModal.createSupplier', defaultMessage: '新增供应商'})
          : formatMessage({ id: 'AddSupplierModal.editSupplier', defaultMessage: '编辑供应商'})
        }
        okText={formatMessage({ id: 'AddSupplierModal.save', defaultMessage: '保存'})}
        cancelText={formatMessage({ id: 'AddSupplierModal.cancel', defaultMessage: '取消'})}
        confirmLoading={confirmLoading}
        onOk={this.submitForm}
        onCancel={this.hideModal}
      >
        <Form onSubmit={this.submitForm}>
          {/* supplier info */}
          <div className="supplier-info">
            <h3>{formatMessage({ id: 'AddSupplierModal.supplierInfo', defaultMessage: '供应商信息'})}</h3>
            <Row className="supplier">
              <Col {...detailInfoCol}>
                <FormItem
                  {...goodsInfoFormLayout}
                  label={<FormattedMessage id={'AddSupplierModal.name'} defaultMessage="供应商全称"/>}
                  className="supplier-name"
                >
                  {getFieldDecorator('name', {
                    initialValue: this.state.name,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage({
                          id: 'AddSupplierModal.inputName',
                          defaultMessage: '请填写供应商全称'
                        }),
                      }
                    ],
                  })(
                    <Input
                      placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                      autoComplete="family-name"
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...detailInfoCol}>
                <FormItem
                  {...goodsInfoFormLayout}
                  label={<FormattedMessage id={'AddSupplierModal.shortName'} defaultMessage="供应商简称"/>}
                  className="supplier-shortName"
                >
                  {getFieldDecorator('shortName', {
                    initialValue: this.state.shortName,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage({
                          id: 'AddSupplierModal.inputShortName',
                          defaultMessage: '请填写供应商简称'
                        }),
                      },
                      {
                        pattern: REGEXP.supplierShortName,
                        message: formatMessage({
                          id: 'AddSupplierModal.shortNameFormat',
                          defaultMessage: '请填写供应商简称'
                        }),
                      }
                    ],
                  })(
                    <Input
                      placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                      autoComplete="given-name"
                    />
                  )}
                </FormItem>
              </Col>

              <Col>
                <FormItem
                  labelCol={{sm: 3, md: 6, lg: 3, xl: 4}}
                  wrapperCol={{sm: 19, md: 16, lg: 20, xl: 20}}
                  label={<FormattedMessage id={'AddSupplierModal.address'} defaultMessage="详细地址"/>}
                  className="address"
                >
                  {getFieldDecorator('address', {
                    initialValue: this.state.address,
                    validateTrigger: 'onBlur',
                    rules: [],
                  })(
                    <TextArea
                      placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                      autoComplete="street-address"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </div>

          {/* contact info */}
          <div className="contact-info">
            <h3>{formatMessage({ id: 'AddSupplierModal.contactInfo', defaultMessage: '联系人信息' })}</h3>
            <div className="contact-cards">
              {this.state.contactList.map((item, index) =>
                <Row key={index} className="contact">
                  {this.state.contactList.length > 1 &&
                    <Icon type="close-circle" onClick={this.deleteContact.bind(this, item.key)} />
                  }
                  <Col {...detailInfoCol}>
                    <FormItem
                      {...goodsInfoFormLayout}
                      label={<FormattedMessage id={'AddSupplierModal.email'} defaultMessage="联系人邮箱"/>}
                      className="email"
                    >
                      {getFieldDecorator(`email${item.key}`, {
                        initialValue: item.email,
                        validateTrigger: 'onBlur',
                        rules: [
                          {
                            required: true,
                            message: formatMessage({
                              id: 'AddSupplierModal.inputEmail',
                              defaultMessage: '请填写联系人邮箱'
                            }),
                          },
                          {
                            type: 'email',
                            message: formatMessage({
                              id: 'AddSupplierModal.emailFormat',
                              defaultMessage: '错误的邮箱格式'
                            })
                          }
                        ],
                      })(
                        <Input
                          placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                          autoComplete="name"
                        />
                      )}
                    </FormItem>
                    <FormItem
                      {...goodsInfoFormLayout}
                      label={<FormattedMessage id={'AddSupplierModal.contactName'} defaultMessage="联系人姓名"/>}
                      className="contactName"
                    >
                      {getFieldDecorator(`contactName${item.key}`, {
                        initialValue: item.contactName,
                        validateTrigger: 'onBlur',
                        rules: [],
                      })(
                        <Input
                          placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                          autoComplete="name"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...detailInfoCol}>
                    <FormItem
                      {...goodsInfoFormLayout}
                      label={<FormattedMessage id={'AddSupplierModal.tel'} defaultMessage="联系人电话"/>}
                      className="tel"
                    >
                      {getFieldDecorator(`tel${item.key}`, {
                        initialValue: item.tel,
                        validateTrigger: 'onBlur',
                        rules: [],
                      })(
                        <Input
                          placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                          autoComplete="name"
                        />
                      )}
                    </FormItem>
                    <FormItem
                      {...goodsInfoFormLayout}
                      label={<FormattedMessage id={'AddSupplierModal.position'} defaultMessage="联系人职务"/>}
                      className="position"
                    >
                      {getFieldDecorator(`position${item.key}`, {
                        initialValue: item.position,
                        validateTrigger: 'onBlur',
                        rules: [],
                      })(
                        <Input
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
            </div>
            <div className="add-contact" onClick={this.addContact}>
             + {formatMessage({ id: 'AddSupplierModal.addContact', defaultMessage: '添加联系人' })}
            </div>
          </div>

          {/* other info */}
          <div className="other-info">
            <h3>{formatMessage({ id: 'AddSupplierModal.otherInfo', defaultMessage: '其他信息' })}</h3>

            <FormItem
              wrapperCol={{span: 24}}
              className="remark"
            >
              {getFieldDecorator('remark', {
                validateTrigger: 'onBlur',
                rules: [],
              })(
                <TextArea
                  placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                />
              )}
            </FormItem>
          </div>
        </Form>
      </Modal>
    )
  }
}
const AddSupplierModal = Form.create()(AddSupplierModalFrom)
export default injectIntl(AddSupplierModal)
