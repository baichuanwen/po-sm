/**
 * Created by zhiyang on 2017/11/16.
 */
import * as React from 'react'
import { Radio, Input, Select, Row, Col } from 'antd'

const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input

interface MallMessageBodyProps {
  messageType?: string
  pushAheadOfMinute?: string
  messageContent?: string
}

interface PushInfoProps {
  value?: MallMessageBodyProps
  disabled?: boolean
  onChange?: (data: any) => void
}

class PushInfo extends React.Component<PushInfoProps> {
  state = {
    messageContent: '',
    messageType: 1,
    pushAheadOfMinute: 0
  }

  handleRadioChange = (e: React.SyntheticEvent<HTMLElement>) => {
    this.setState({
      // messageContent: '',
      messageType: (e.target as HTMLInputElement).value,
      pushAheadOfMinute: 1,
    }, this.triggerChange)
  }

  handleMinuteChange = (value: string) => {
    this.setState({pushAheadOfMinute: value}, this.triggerChange)
  }

  handleContentChange = (e: React.SyntheticEvent<HTMLElement>) => {
    this.setState({messageContent: (e.target as HTMLInputElement).value}, this.triggerChange)
  }

  triggerChange = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange({
        ...this.state
      })
    }
  }

  componentWillReceiveProps (nextProps: PushInfoProps) {
    const { value } = nextProps
    this.setState({
      ...value
    })
  }

  componentDidMount () {
    const { value } = this.props
    this.setState({
      ...value
    })
  }

  render () {
    const {
      messageType,
      pushAheadOfMinute,
      messageContent
    } = this.state
    const { disabled } = this.props
    return (
      <div>
        <Row>
          <Col span={24}>
            <RadioGroup value={messageType} onChange={this.handleRadioChange} disabled={disabled}>
              <Radio value={1}>上架时推送</Radio>
              <Radio value={2}>开售前推送</Radio>
            </RadioGroup>
          </Col>
        </Row>
        {
          messageType === 2
          ? (
              <Row>
                <Col span={6}>
                  提前推送时间
                </Col>
                <Col span={8}>
                  <Select
                    value={String(pushAheadOfMinute) || '1'}
                    onChange={this.handleMinuteChange}
                    disabled={disabled}
                  >
                    <Option value="1">1分钟</Option>
                    <Option value="2">2分钟</Option>
                    <Option value="3">3分钟</Option>
                  </Select>
                </Col>
              </Row>
            )
          : null
        }
        <Col span={24}>
          <TextArea
            rows={4}
            maxLength={100}
            disabled={disabled}
            value={messageContent}
            onChange={this.handleContentChange}
            placeholder="输入推送信息的内容"
          />
        </Col>
      </div>
    )
  }
}

export default PushInfo
