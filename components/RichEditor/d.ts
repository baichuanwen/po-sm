import { EditorState } from 'draft-js'
// import { InjectedIntlProps } from 'react-intl'

export interface BlockStyleControlsProps {
  editorState?: EditorState
  key?: string
  active?: boolean
  style?: string
  label?: string
  children?: React.ReactNode
  onToggle(a: string): void
}

export interface PicUploadButtonProps {
  insertImage?: any
}
