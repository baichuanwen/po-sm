/**
 * Created by zhiyang on 2017/12/12.
 * 使用 ant.design 封装的地址选择器
 */
import * as React from 'react'
import { Cascader, Input } from 'antd'
// import { CascaderProps } from 'antd/lib/cascader'
import { areas } from './areas'

interface AddressPickerProps {
  onChange?: (value: string[]) => void
}

class AddressPicker extends React.Component<AddressPickerProps> {
  state = {
    addr: ['上海', '上海市', '闵行区'],
    detailAddr: ''
  }

  handleAddrChange = (value: string[]) => {
    this.setState({
      addr: value
    }, this.triggerChange)
  }

  handleDetailAddrInput = (e: React.SyntheticEvent<HTMLElement>) => {
    this.setState({
      detailAddr: (e.target as HTMLInputElement).value
    }, this.triggerChange)
  }

  triggerChange = () => {
    const { onChange } = this.props
    const { addr, detailAddr } = this.state
    const [ province, city, area ]: string[] = addr

    if (onChange) {
      onChange([
        province,
        city,
        area,
        detailAddr
      ])
    }
  }
  // componentWillReceiveProps (nextProps) {
  //   const {addr, detailAddr} = nextProps.value
  // }
  render () {
    return (
      <div style={{display: 'flex'}}>
        <Cascader
          options={areas}
          onChange={this.handleAddrChange}
          placeholder="选择地址"
          style={{ width: 200 }}
        />
        <Input
          onChange={this.handleDetailAddrInput}
          placeholder="详细的地址"
          style={{width: 300, marginLeft: 20}}
          // maxLength={50}
        />
      </div>
    )
  }
}

export default AddressPicker
