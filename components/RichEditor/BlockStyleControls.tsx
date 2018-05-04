import * as React from 'react'

import { BlockStyleControlsProps } from './d'
import { InjectedIntlProps } from 'react-intl'

class StyleButton extends React.Component<BlockStyleControlsProps> {
  onToggle = (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault()
    this.props.onToggle(this.props.style || '')
  }

  render () {
    const className = `RichEditor-styleButton ${this.props.active ? 'RichEditor-activeButton' : ''}`
    return (
      <button className={className} onClick={this.onToggle}>
        {this.props.label}
      </button>
    )
  }
}
// draft.js 默认的 blockType 类型
// https://github.com/facebook/draft-js/blob/master/src/model/immutable/DefaultDraftBlockRenderMap.js
const BlockStyleControls = (props: BlockStyleControlsProps & InjectedIntlProps) => {
  const { editorState, children } = props
  const selection = editorState ? editorState.getSelection() : ''
  const startKey = selection ? selection.getStartKey() : ''
  const blockType = editorState ? editorState.getCurrentContent().getBlockForKey(startKey).getType() : ''

  const { intl: { formatMessage } } = props
  const BLOCK_TYPES = [
    {
      label: formatMessage({ id: 'RichEditor.title', defaultMessage: '标题'}),
      style: 'header-three'
    },
    {
      label: formatMessage({ id: 'RichEditor.content', defaultMessage: '正文'}),
      style: 'unstyled'
    }
  ]

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          style={type.style}
          onToggle={props.onToggle}
        />
      )}
      {children}
    </div>
  )
}

export default BlockStyleControls
