import * as React from 'react'
import {
  Editor,
  EditorState,
  EditorProps,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  ContentBlock,
  convertFromRaw,
  RawDraftContentState,
} from 'draft-js'
import { InjectedIntlProps } from 'react-intl'

import BlockStyleControls from './BlockStyleControls'
import PicUploadButton from './PicUploadButton'
import MediaComponent from './MediaComponent'
import { BlockStyleControlsProps, PicUploadButtonProps } from './d'

import { history, config } from '@Utilities'

import './index.less'

interface UploadContent {
  content: string
  type: string
}

interface NewEditorProps extends EditorProps {
  initialValue: RawDraftContentState
  uploadRichEditorData?: (content: RawDraftContentState, data: UploadContent[]) => {}
}

class RichEditor extends React.Component<
  {}
  & NewEditorProps
  & BlockStyleControlsProps
  & PicUploadButtonProps
  & InjectedIntlProps
> {
  state = {
    editorState: EditorState.createEmpty()
  } // 创建空的 EditorState 对象

  componentDidMount () {
    const { initialValue } = this.props

    if (initialValue) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(initialValue))
      })
    }
  }

  insertImage = (data: object) => {
    const { editorState } = this.state
    const contentState = editorState && editorState.getCurrentContent()
    const contentStateWithEntity = contentState && contentState.createEntity(
      'img',
      'IMMUTABLE',
      data
    )
    const entityKey = contentStateWithEntity && contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity }
    )
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    })
  }

  toggleBlockType = (blockType: string) => {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType))
  }

  onChange = (editorState: EditorState) => this.setState({ editorState })

  /**
   * on blur upload data
   */
  uploadData = () => {
    const { content, clientDesc } = this.convertData()
    // tslint:disable-next-line
    this.props.uploadRichEditorData && this.props.uploadRichEditorData(content, clientDesc)
  }

  mediaBlockRenderer = (block: ContentBlock) => {
    if (block.getType() === 'atomic') {
      return {
        component: MediaComponent,
        editable: false
      }
    }
    return null
  }

  /**
   * 转换数据
   */
  convertData = () => {
    const content = convertToRaw(this.state.editorState.getCurrentContent())
    // 图片的信息存储在 entityMap 中
    const { blocks, entityMap } = content
    const clientDesc = blocks.map(({type, text, entityRanges}) => {
      if (type !== 'atomic') {
        return {
          type: type === 'unstyled' ? 'text' : 'title',
          content: text
        }
      } else {
        // 这里的 media 只有 image，没有判别 type
        if (!(entityRanges && entityRanges.length)) {
          // console.log(JSON.stringify(content))
          // console.error(entityRanges)
        }
        const {url, w, h} = entityMap[entityRanges[0].key].data
        return {
          type: 'image',
          content: `${url}|${w}|${h}`
        }
      }
    })
    return { content, clientDesc }
  }

  render () {
    const { editorState } = this.state
    const { clientDesc } = this.convertData()
    const { location: { pathname } } = history
    const { intl, intl: { formatMessage } } = this.props

    const blockConfig = {
      intl: intl,
      editorState: editorState,
      onToggle: this.toggleBlockType,
    }
    const picUploadConfig = {
      intl: intl,
      insertImage: this.insertImage,
    }
    return (
      <div className="RichEditor-root">
        <div className="RichEditor-controls-title">
          {!pathname.includes('view') &&
            <BlockStyleControls {...blockConfig}>
              <PicUploadButton {...picUploadConfig}/>
            </BlockStyleControls>
          }
          <p className="preview-title">
          {formatMessage({ id: 'RichEditor.previewArea', defaultMessage: '预览区域'})}
          </p>
        </div>
        <div className="RichEditor-edit-container">
          {!pathname.includes('view') &&
            <Editor
              editorState={editorState}
              stripPastedStyles={true}
              blockRendererFn={this.mediaBlockRenderer}
              placeholder={formatMessage({ id: 'RichEditor.goodsInfoPlace', defaultMessage: '填写商品详情信息'})}
              onChange={this.onChange}
              onBlur={this.uploadData}
            />
          }
          <div className="RichEditor-preview-wrap">
            <div className="RichEditor-preview">
            {clientDesc.map(({type, content}, index) => {
              if (type === 'image') {
                return (
                  <img
                    key={index}
                    src={`${config.qiniu.file1}${content.split('|')[0]}`}
                    alt={formatMessage({ id: 'RichEditor.insertImage', defaultMessage: '插入的图片'})}
                  />
                )
              } else if (type === 'title') {
                return <p key={index} className="text-title">{content}</p>
              } else {
                return <p key={index}>{content}</p>
              }
            })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default RichEditor
