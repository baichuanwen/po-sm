/**
 * Created by zhiyang on 2017/11/14.
 */
import * as React from 'react'
import { EditorProps, ContentState, ContentBlock } from 'draft-js'
import { config } from '@Utilities'

interface MediaProps extends ContentState {
  block: ContentBlock
  contentState: ContentState
}

class MediaComponent extends React.Component<EditorProps & MediaProps> {
  render () {
    const { block, contentState } = this.props
    const entity = contentState.getEntity(block.getEntityAt(0))
    const { url } = entity.getData()
    const type = entity.getType()
    let media = null
    // 考虑到以后还可能有视频
    if (type === 'img') {
      media = <img src={`${config.qiniu.file1}/${url}`} className="RichEditor-pic" alt="用户上传的图片"/>
    }
    return media
  }
}

export default MediaComponent
