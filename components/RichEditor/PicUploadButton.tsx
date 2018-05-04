/**
 * Created by nicolaszs on 2018/01/15.
 */
import * as React from 'react'
import { InjectedIntlProps } from 'react-intl'

import { PicUploadButtonProps } from './d'
import { axios, config } from '@Utilities'

interface NewPicUploadButtonProps extends PicUploadButtonProps {
  insertImage: (data: object) => void
}

class PicUploadButton extends React.Component<NewPicUploadButtonProps & InjectedIntlProps> {
  state = {
    token: ''
  }

  /**
   * get upload token
   */
  componentDidMount () {
    axios.get('/qiniu/uptoken').then(res => {
      this.setState({ token: res.data.data })
    })
  }

  /**
   * Select Pic
   */
  selectPic = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const picUpload = document.getElementById('picUpload') as HTMLInputElement
    picUpload.value = ''
    picUpload.click()
  }

  /**
   * upload pic
   */
  uploadPic = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    const picUpload = document.getElementById('picUpload') as HTMLInputElement
    const { files } = picUpload

    let action = config.qiniu && config.qiniu.http
    if (window.location.protocol === 'https:') {
      action = config.qiniu && config.qiniu.https
    }

    if (files && files.length) {
      const formData = new FormData()
      formData.append('token', this.state.token)
      formData.append('file', files[0])
      axios.post(action, formData).then(res => {
        this.props.insertImage(res.data)
      })
    }
  }

  render () {
    const { intl: { formatMessage } } = this.props

    return (
      <div style={{display: 'inline-block'}}>
        <button className="RichEditor-styleButton upload-pic" onClick={this.selectPic}>
          {formatMessage({ id: 'RichEditor.uploadImage', defaultMessage: '上传图片'})}
        </button>
        <input
          id="picUpload"
          style={{display: 'none'}}
          type="file"
          accept="image/jpg,image/jpeg,image/png"
          onChange={this.uploadPic}
        />
      </div>
    )
  }
}

export default PicUploadButton
