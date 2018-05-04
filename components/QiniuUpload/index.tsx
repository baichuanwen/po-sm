import * as React from 'react'
import { Icon, Upload, Modal, message } from 'antd'
import { UploadProps } from 'antd/lib/upload'
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface'

import { axios, getPicSrc, config, history } from '@Utilities'

interface NewState {
  previewVisible: boolean
  previewImage: string
  fileList: UploadFile[]
  token?: string
}

interface QiniuUploadProps extends UploadProps {
  token?: string
  host?: string
  count?: number
  imagesUrls?: string[] | undefined
  onChange?: (res: UploadChangeParam | string[] | undefined) => void
}

export default class QiniuUpload extends React.Component<QiniuUploadProps> {
  state: NewState = {
    previewVisible: false,
    previewImage: '',
    fileList: [],
    token: '',
  }

  /**
   * get upload token
   */
  componentWillMount () {
    axios.get('/qiniu/uptoken').then(res => {
      this.setState({ token: res.data.data })
    })
  }

  componentDidMount () {
    const newFileList = (this.props.imagesUrls || []).map((item: string, index: number) => ({
        uid: item.split('|')[0],
        name: '',
        status: 'done',
        type: 'pic',
        size: 1024,
        response: {
          url: item.split('|')[0],
          w: item.split('|')[1],
          h: item.split('|')[2],
        },
        url: getPicSrc(item.split('|')[0]),
    }))
    this.setState({ fileList: newFileList })
  }

  shouldComponentUpdate?(nextProps: QiniuUploadProps, nextState: NewState) {
    const { location: { search } } = history
    const id = search.split('=')[1]

    /**
     * 编辑产品时，当产品有 id
     * 并且 token更新
     * imagesUrls.length > 0
     * 更新组件
     */
    if (id && nextState.token
      && nextProps.imagesUrls && nextProps.imagesUrls.length > 0) {
      return true
    }

    /**
     * 创建产品时
     * token更新
     * 更新组件
     */
    if (!id && nextState.token) {
      return true
    }

    // if (nextState.fileList[nextState.fileList.length - 1]) {
    //   return true
    // }
    return false
  }

  /**
   * 上传图片判断图片大小小于 2M
   */
  beforeUpload = (file: UploadFile) => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('上传的图片大小不能超过2M！')
    }
    return isLt2M
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file: UploadFile) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }

  handleChange = ({ fileList, file }: UploadChangeParam) => {
    if (file.status === 'done') {
      // tslint:disable-next-line
      // this.props.onChange && this.props.onChange({file, fileList})
      this.triggerChange({ file, fileList })
      // this.setState(fileList)
      // 传递给外面的表单
    }
    this.setState({ fileList })
  }

  handleRemove = (file: UploadFile) => {
    const fileList = this.state.fileList.filter(item => item.uid !== file.uid)
    this.triggerChange({ file, fileList })
  }

  triggerChange = ({ fileList }: UploadChangeParam) => {
    // Should provide an event to pass value to Form.
    const value = fileList.length !== 0
      ? fileList.map((item: UploadFile) =>
          item.response && `${item.response.url}|${item.response.w}|${item.response.h}`
        )
      : undefined

    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { previewVisible, previewImage, fileList } = this.state
    // console.log(this.props)

    const uploadButton = (
      <div>
        <Icon type="plus"/>
        <div className="ant-upload-text">上传</div>
      </div>
    )

    let action = config.qiniu && config.qiniu.http
    if (window.location.protocol === 'https:') {
      action = config.qiniu && config.qiniu.https
    }

    const count = this.props.count || 1
    return (
      <div>
        <Upload
          accept="image/jpg,image/jpeg,image/png"
          listType="picture-card"
          data={{ token: this.state.token }}
          action={action}
          fileList={fileList}
          multiple={true}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          beforeUpload={this.beforeUpload}
          onRemove={this.handleRemove}
        >
          {fileList.length >= count ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{width: '100%'}} src={previewImage}/>
        </Modal>
      </div>
    )
  }
}
