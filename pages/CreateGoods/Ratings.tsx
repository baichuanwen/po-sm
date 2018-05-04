import * as React from 'react'
import { Row, Col, Checkbox, InputNumber } from 'antd'
import { CheckboxOptionType } from 'antd/lib/checkbox/Group'
import { InjectedIntlProps } from 'react-intl'

import { history } from '@Utilities'

const CheckboxGroup = Checkbox.Group

interface NewCheckboxOptionType extends CheckboxOptionType {
  id?: number
  grade?: number | undefined
  disabled?: boolean
  checked: boolean
  maxValue?: number
  minValue?: number
}

interface RatingsProps extends InjectedIntlProps {
  value?: NewCheckboxOptionType[]
  rating: NewCheckboxOptionType[]
  // tslint:disable-next-line
  onChange?: (x: any) => void
}

export default class Ratings extends React.Component<RatingsProps> {
  state = {
    ratingsCheckOptions: [
      {
        checked: false,
        disabled: false,
        grade: undefined,
        id: 1,
        label: '酒花儿',
        name: '酒花儿',
        value: '1',
      }
    ],
  }

  componentWillMount () {
    const {
      intl: { locale },
      rating,
      value,
    } = this.props

    const params = {
      type: 'ratingsCheckOptions',
      locale: locale,
      data: rating || [],
      value: value,
    }
    const newRatingsCheckOptions = this.generateNewData(params)
    this.setState({ ratingsCheckOptions: newRatingsCheckOptions })
  }

  /**
   * generate new data
   * 转换级联下拉接口数据
   * 如果是级联选择，添加 isLeaf，loading
   * 如果是商品评分，添加 checked，disable，grade
   */
  // tslint:disable-next-line
  generateNewData = ({type, locale, data, value}: any) => {
    const { location: { pathname } } = history

    return Array.isArray(data)
      ? data.map(item => {
        // 返回的基础数据
        const basicData = {
          ...item,
          name: item[`${locale === 'zh' ? 'cnName' : 'enName' }`] || item.name || item.attrName,
          label: item[`${locale === 'zh' ? 'cnName' : 'enName' }`] || item.name || item.attrName,
          value: item.id + '',
        }

        // 如果是商品评分，添加 checked，disable，grade
        if (type === 'ratingsCheckOptions') {
          /**
           * 当 item.id 在 value中有值存在
           * 找到其在 value中的位置
           * 初始化 checked和 value
           */
          const pos = value.findIndex((rate: NewCheckboxOptionType) => rate.id === item.id)
          const withoutDisabeldData = {
            ...basicData,
            checked: pos !== -1 ? true : false,
            grade: pos !== -1 ? value[pos].value : undefined,
          }

          /**
           * 如果页面是查看状态
           * check box 禁用
           */
          if (pathname.includes('view')) {
            return {
              ...withoutDisabeldData,
              disabled: true,
            }
          }

          /**
           * value.length === 3
           * pos === -1 的check box 禁用
           */
          if (value.length === 3 && pos === -1) {
            return {
              ...withoutDisabeldData,
              disabled: true,
            }
          }

          return {
            ...withoutDisabeldData,
            disabled: false,
          }
        }

        return basicData
      })
      : this.state[type]
  }

  /**
   * 选择商品评分机构
   */
  checkGradeBrand = (checkedValue: string[]) => {
    const { ratingsCheckOptions } = this.state
    /**
     * 选中的 checkbox
     * 更新 checkboxOptions
     * 选中的设置 Checked为 true
     */
    const newCheckedOptions = ratingsCheckOptions.map((item: NewCheckboxOptionType): NewCheckboxOptionType => {
      if (checkedValue.findIndex((e: string) => e === item.value) > -1) {
        return {...item, checked: true}
      }
      return {...item, checked: false}
    })

    /**
     * 最多只能选择 3个
     * 若已选择 3项，灰掉第 4项
     * 若选择少于 3项，激活所有
     */
    if (checkedValue.length === 3) {
      const newOptions = newCheckedOptions.map((item: NewCheckboxOptionType): NewCheckboxOptionType => {
        if (checkedValue.findIndex((e: string) => e === item.value) === -1) {
          return {...item, disabled: true}
        }
        return {...item, disabled: false}
      })

      this.triggerChange(newOptions)
      return this.setState({ ratingsCheckOptions: newOptions })
    }

    this.setState({ ratingsCheckOptions: newCheckedOptions.map(item => ({...item, disabled: false }))})
    this.triggerChange(newCheckedOptions.map(item => ({...item, disabled: false })))
  }

  /**
   * 修改对应的机构评分
   * 更新对应机构的评分
   */
  // tslint:disable-next-line
  gradeInputChange = (type: string, value: any) => {
    const { ratingsCheckOptions } = this.state
    const newOptions = ratingsCheckOptions.map(item => {
      if (item.label === type) {
        return {...item, grade: value - 0}
      }
      return item
    })
    this.setState({ ratingsCheckOptions: newOptions })
    this.triggerChange(newOptions)
  }

  triggerChange = (ratingsCheckOptions: NewCheckboxOptionType[]) => {
    // Should provide an event to pass value to Form.
    const value = ratingsCheckOptions
      .filter(item => item.checked)
      .map((item: NewCheckboxOptionType) => ({ id: item.id, value: item.grade }))

    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props

    const { location: { pathname } } = history
    
    return (
      <article className="goods-grade">
        <header className="goods-grade-header">
        {formatMessage({ id: 'CreateGoods.lessThanThree', defaultMessage: '最多只能勾选 3个评分'})}
        </header>
        <Row>
          <Col md={12} lg={6} xl={12}>
            <CheckboxGroup
              defaultValue={this.state.ratingsCheckOptions.filter(e => e.checked).map(e => e.value)}
              onChange={this.checkGradeBrand}
              options={this.state.ratingsCheckOptions}
            />
          </Col>
          <Col md={12} lg={12} xl={12}>
            {this.state.ratingsCheckOptions.map((item: NewCheckboxOptionType) => {
              /**
               * 如果评分按钮被选中，并且 grade是 undefined
               * 提示请输入评分
               */
              const InputDOM = !pathname.includes('view')
                ? <InputNumber
                  defaultValue={item.grade}
                  placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                  min={item.minValue}
                  max={item.maxValue}
                  disabled={item.disabled || !item.checked}
                  onChange={this.gradeInputChange.bind(this, item.label)}
                />
                : <span>{item.grade ? item.grade : '暂无'}</span>
              // if (item.checked && item.grade === undefined) {
              //   return <div key={`${item.value}InputNumber`}>
              //     {InputDOM}
              //     <div className="grade-require" key={`${item.value}warning`}>请输入评分</div>
              //   </div>
              // }
              return (
                <div
                  key={`${item.value}warning`}
                  className={item.checked ? 'grade grade-require' : 'grade'}
                >
                {InputDOM}
                </div>
              )
            })}
          </Col>
        </Row>
      </article>
    )
  }
}
