import * as React from 'react'
import { Row, Col, Input, InputNumber, Checkbox, Table } from 'antd'
import { CheckboxOptionType } from 'antd/lib/checkbox/Group'
import { ColumnProps } from 'antd/lib/table'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import { axios, history } from '@Utilities'
import { DropData } from '@Redux/d'
import './index.less'

interface ListsUser {
  key: string
  skuName?: string
  barCode?: string
  properties?: string
  retailPrice?: number
  loading?: boolean
  pagination?: boolean
}

interface NewCheckboxOptionType extends CheckboxOptionType {
  grade?: number
  checked: boolean
  attrValue?: string
  id?: number
  properties?: string

  name?: string
  detailOptions?: NewCheckboxOptionType[]
}

interface NewState {
  disabled: boolean
  hasSku: boolean
  skusCheckOptions: NewCheckboxOptionType[]
  dataSource?: ListsUser[]
}

interface SkuInfoProps extends NewCheckboxOptionType {
  id?: number
  hasSku: boolean
  // tslint:disable-next-line
  names?: any[]
  // tslint:disable-next-line
  skus?: any[]
  // tslint:disable-next-line
  uploadData(hasSku: boolean, data: any): ListsUser[]
}

// interface NewModalProps extends ModalProps {
//   names?: any[]
//   createOrEditSupplier: () => {}
// }

const CheckboxGroup = Checkbox.Group

/* fake data --start*/
const skusCheckOptions = [
  {
    name: 'scale',
    label: '尺码',
    value: '1',
    checked: false,
    disabled: false,
    detailOptions: [],
  },
]
/* fake data --end*/

class SkusInfo extends React.Component<InjectedIntlProps & SkuInfoProps> {
  state: NewState = {
    disabled: false,
    hasSku: false,
    skusCheckOptions: skusCheckOptions,
    dataSource: [{
      key: '',
      barCode: '',
      properties: '',
      retailPrice: 0,
    }],
  }

  componentWillMount () {
    const {
      intl: { locale },
      names,
      hasSku,
      skus,
      id,
    } = this.props

    const { location: { pathname } } = history

    /**
     * hasSku === true
     * Promise.all 一次性请求数据
     * 等待数据返回，再渲染 checkbox列表
     */
    if (Array.isArray(names) && (hasSku || id === undefined)) {
      Promise.all(
        names.map(item => (axios.get(`product/attribute/${item.id}/values`)))
      ).then(res => {
        // 获取当前的 value所对应的 skusCheckOptions中的元素的位置
        // 遍历更新 detailOptions
        const newSkusCheckOptions = names.map((value, index) => {
          /**
           * 根据当前 skus的 properties 里面包含的 id
           * 判断 id 是否被选中过
           */
          const posArr = Array.isArray(skus) && (skus || [])
            .map(sku => sku.properties && sku.properties.split(';')
              .map((e: string) => e.split(':'))
              .reduce((pre: string[], next: string[]) => pre.concat(next))
              .map((e: string) => Number(e))
            )

          // 颜色，容量等属性的 pos搜索
          const namePos = (posArr || []).length > 0
            ? posArr[0].findIndex((propertyId: number) => propertyId === value.id)
            : -1

          return {
            ...value,
            checked: namePos > -1 ? true : false,
            disabled: Number(id) > -1 ? true : false,
            detailOptions: res.map(item => item.data.data)[index].map((detail: DropData) => {
              // 详细规格属性的搜索
              const attrPos = (posArr || []).length > 0
                ? (posArr || [])
                  // 展平 posArr [ [2, 8], [3, 4]] => [2, 8, 3, 4]
                  .reduce((pre: number[], next: number[]) => pre.concat(next))
                  // 过滤掉父类 names的 id属性
                  .filter((attrId: number, attrIndex: number) => attrIndex % 2 === 1)
                  .findIndex((propertyId: number) => propertyId === detail.id)
                : -1

              return {
                ...detail,
                name: detail[`${locale === 'zh' ? 'cnName' : 'enName' }`] || detail.name || detail.attrValue,
                label: detail[`${locale === 'zh' ? 'cnName' : 'enName' }`] || detail.name || detail.attrValue,
                value: detail.id + '',
                checked: attrPos > -1 ? true : false,
                disabled: pathname.includes('view') ? true : false,
              }
            })
          }
        })

        this.setState({
          hasSku: hasSku,
          skusCheckOptions: newSkusCheckOptions,
          dataSource: id
            ? (skus || []).map((item: NewCheckboxOptionType) => ({...item, key: item.id }))
            : this.state.dataSource,
        })
      })
    }

    /**
     * hasSku === false && id 存在
     * 无需请求接口数据
     */
    if (!hasSku && id !== undefined) {
      this.setState({
        hasSku: hasSku,
        dataSource: (skus || []).map((item: NewCheckboxOptionType) => ({...item, key: item.id })),
      })
    }
  }

  /**
   * have skus or not
   */
  hasSkus = (): void => {
    this.setState({
      hasSku: !this.state.hasSku,
      dataSource: this.state.hasSku
        ? [{ key: '', barCode: '', properties: '', retailPrice: 0, }]
        : [],
    })
  }

  /**
   * 选择 skus
   * 最多只能选择 2个
   * 若已选择 2项，灰掉其他项
   */
  selectSkus = (checkedValue: number[]) => {
    // console.log(checkedValue)
    // const {
    //   intl: { locale }
    // } = this.props
    /**
     * 选中的 checkbox
     * 更新 checkboxOptions
     * 选中的设置 Checked为 true
     */
    const newCheckedOptions = this.state.skusCheckOptions.map((item: NewCheckboxOptionType): NewCheckboxOptionType => {
      if (checkedValue.findIndex((e: number) => e === item.value) > -1) {
        return {...item, checked: true}
      }
      return {...item, checked: false}
    })

    /**
     * 最多只能选择 2个
     * 若已选择 2项，灰掉第 3项
     * 若选择少于 2项，激活所有
     */
    if (checkedValue.length === 2) {
      const newOptions = newCheckedOptions.map((item: NewCheckboxOptionType): NewCheckboxOptionType => {
        if (checkedValue.findIndex((e: number) => e === item.value) === -1) {
          return {...item, disabled: true}
        }
        return {...item, disabled: false}
      })

      return this.setState({ skusCheckOptions: newOptions })

      // update Table DataSource
      // this.generateTableDataSource(newOptions)
    }

    this.setState({ skusCheckOptions: newCheckedOptions.map(item => ({...item, disabled: false }))})

    // update Table DataSource
    this.generateTableDataSource(newCheckedOptions.map(item => ({...item, disabled: false })))
  }

  /**
   * 选择具体某一项的详细规格
   * 更新数据到列表中
   * 筛选出被修改的那一项 changedDetailCheckedOptions，并找到它在数组中的位置
   * 根据选择的 checkedValue，更新被修改的那一项的 detailOptions数据
   * update skusCheckOptions
   */
  selectDetailSkus = (type: string, checkedValue: number[]) => {
    // 修改的那一项 changedDetailCheckedOptions
    const changedDetailCheckedOptions = this.state.skusCheckOptions.filter(item => item.name === type)[0]
    // 数组中的位置 pos
    const pos = this.state.skusCheckOptions.findIndex(item => item.name === type)

    // 根据选择的 checkedValue，更新被修改的那一项的 detailOptions数据
    const newChangeDetailOptions = (changedDetailCheckedOptions.detailOptions || [])
      .map((item: NewCheckboxOptionType): NewCheckboxOptionType => {
        if (checkedValue.findIndex((e: number) => e === item.value) > -1) {
          return {...item, checked: true}
        }
        return {...item, checked: false}
      })

    // update skusCheckOptions
    this.state.skusCheckOptions[pos].detailOptions = newChangeDetailOptions
    this.setState({skusCheckOptions: this.state.skusCheckOptions})

    // update Table DataSource
    this.generateTableDataSource(this.state.skusCheckOptions)
  }

  // rowClick = (row: any) => {
  //   console.log(row.key)
  // }

  /**
   * generate table data source
   */
  /* tslint:disable */
  generateTableDataSource = (skusCheckOptions: any) => {
    const { skus } = this.props
    const data: ListsUser[] = []
    const checkedSkus = skusCheckOptions
      .filter((e: any) => e.checked)
      .map((e: any) => e.detailOptions.map((item: any) => ({...item, parentId: e.id,})))
    const firstAttr = (checkedSkus[0] || []).filter((first: any) => first.checked)
    const secondAttr = (checkedSkus[1] || []).filter((second: any) => second.checked)

    /**
     * 如果只选择一个 attr
     * 选择 2个 attr，遍历拼接 dataItem
     */
    if (firstAttr.length > 0) {
      firstAttr.map((item: any) => {
        if (secondAttr.length > 0) {
          secondAttr.map((e: any) => {
            /**
             * 如果 properties已经存在，则初始化 retailPrice为 skus内的值
             */
            const pos = (skus || []).findIndex(sku => {
              return sku.properties === `${item.parentId}:${item.value};${e.parentId}:${e.value}`
            })

            const dataItem: ListsUser = {
              key: `${item.parentId}:${item.value};${e.parentId}:${e.value}`,
              // barCode: pos > -1
              //   ? Array.isArray(skus) && skus[pos].barCode
              //   : `${item.label}|${e.label}`,
              skuName: `${item.label}；${e.label}`,
              barCode: '',
              properties: `${item.parentId}:${item.value};${e.parentId}:${e.value}`,
              retailPrice: pos > -1
                ? Array.isArray(skus) && skus[pos].retailPrice
                : 0,
            }
            data.push(dataItem)
          })
        } else {
          /**
           * 如果 properties已经存在，则初始化 retailPrice为 skus内的值
           */
          const pos = (skus || []).findIndex(sku => sku.properties === `${item.parentId}:${item.value}`)
          const dataItem: ListsUser = {
            key: `${item.parentId}:${item.value}`,
            // barCode: pos > -1
            //   ? Array.isArray(skus) && skus[pos].barCode
            //   : `${item.label}`,
            skuName: `${item.label}`,
            barCode: '',
            properties: `${item.parentId}:${item.value}`,
            retailPrice: pos > -1
              ? Array.isArray(skus) && skus[pos].retailPrice
              : 0,
          }
          data.push(dataItem)
        }
      })
    }

    /**
     * 第一个属性未选择
     * 第二个属性勾选了
     */
    if (firstAttr.length === 0 && secondAttr.length > 0) {
      secondAttr.map((e: any) => {
        const pos = (skus || []).findIndex(sku => sku.properties === `${e.parentId}:${e.value}`)

        const dataItem: ListsUser = {
          key: `${e.parentId}:${e.value}`,
          // barCode: pos > -1
          //   ? Array.isArray(skus) && skus[pos].barCode
          //   : `${e.label}`,
          skuName: `${e.label}`,
          barCode: '',
          properties: `${e.parentId}；${e.value}`,
          retailPrice: pos > -1
            ? Array.isArray(skus) && skus[pos].retailPrice
            : 0,
        }
        data.push(dataItem)
      })
    }

    this.setState({ dataSource: data })

    this.props.uploadData(this.state.hasSku, data.map((item: ListsUser) => ({
      barCode: item.barCode,
      properties: item.properties,
      retailPrice: item.retailPrice,
    })))
  }

  /**
   * update bar code
   */
  updateBarCode = (key: string, e: React.SyntheticEvent<HTMLInputElement>) => {
    const newDataSource = (this.state.dataSource || []).map(item => {
      if (item.key === key) {
        return {...item, barCode: (e.target as HTMLInputElement).value}
      }
      return item
    })

    this.setState({ dataSource: newDataSource })
    this.props.uploadData(this.state.hasSku, newDataSource.map((item: ListsUser) => ({
      barCode: item.barCode,
      properties: item.properties,
      retailPrice: item.retailPrice,
    })))
  }

  /**
   * updateretailPrice
   */
  updateretailPrice = (key: string, price: number | string) => {
    const newDataSource = (this.state.dataSource || []).map(item => {
      if (item.key === key) {
        return {...item, retailPrice: price}
      }
      return item
    })

    this.setState({ dataSource: newDataSource })
    this.props.uploadData(this.state.hasSku, newDataSource.map((item: ListsUser) => ({
      barCode: item.barCode,
      properties: item.properties,
      retailPrice: item.retailPrice,
    })))
  }

  // triggerChange = (skus: any) => {
  //   // Should provide an event to pass value to Form.
  //   console.log(skus)
  //   // const value = ratingsCheckOptions
  //   //   .filter(item => item.checked)
  //   //   .map((item: NewCheckboxOptionType) => ({ id: item.id, value: item.grade }))
  //
  //   const onChange = this.props.onChange
  //   if (onChange) {
  //     onChange(value)
  //   }
  // }

  render() {
    const {
      intl: { formatMessage },
      id,
    } = this.props

    const {
      hasSku,
    } = this.state

    const { location: { pathname } } = history

    const names: ColumnProps<ListsUser>[] = [
      {
        key: 'skuName',
        title: formatMessage({ id: 'CreateGoods.skuName', defaultMessage: 'Sku 名称'}),
        dataIndex: 'skuName',
        width: 100,
        className: 'sku-code',
      },
    ]

    const columns: ColumnProps<ListsUser>[] = [
      {
        key: 'barCode',
        title: formatMessage({ id: 'CreateGoods.barCode', defaultMessage: 'Sku 编码'}),
        dataIndex: 'barCode',
        width: 100,
        className: 'sku-code',
        render: (barCode, data) => {
          if (!pathname.includes('view')) {
            return (
              <Input
                defaultValue={barCode}
                onChange={this.updateBarCode.bind(this, data.key)}
              />
            )
          }
          return <span>{barCode}</span>
        },
      },
      {
        key: 'retailPrice',
        title: formatMessage({ id: 'CreateGoods.price', defaultMessage: '建议零售价'}),
        dataIndex: 'retailPrice',
        width: 100,
        render: (retailPrice, data) => {
          if (!pathname.includes('view')) {
            return (
              <InputNumber
                min={0}
                max={99999}
                defaultValue={retailPrice}
                onChange={this.updateretailPrice.bind(this, data.key)}
              />
            )
          }
          return <span>{retailPrice}</span>
        },
      },
    ]

    const tableConfig = {
      columns: this.state.hasSku ? names.concat(columns) : columns,
      dataSource: this.state.dataSource,
      // onRow: this.rowClick,
      scroll: {
        y: 400
      },
      pagination: false,
    }

    return (
      <article className="skus-info">
        <h3>{formatMessage({ id: 'CreateGoods.skuInfo', defaultMessage: '规格信息'})}</h3>
        <section>
          <Row>
            <Col>
              <Checkbox
                disabled={Number(id) > -1}
                checked={this.state.hasSku}
                onChange={this.hasSkus}
              >
              {formatMessage({ id: 'CreateGoods.setSkusAttr', defaultMessage: '请设置商品规格属性'})}
              </Checkbox>
            </Col>
            {hasSku &&
              <Col className="sku-options">
                <span>{formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择'})}</span>
                <CheckboxGroup
                  defaultValue={this.state.skusCheckOptions.filter(e => e.checked).map(e => e.value)}
                  options={this.state.skusCheckOptions}
                  onChange={this.selectSkus}
                />
              </Col>
            }
            {hasSku && this.state.skusCheckOptions.map((item: NewCheckboxOptionType) => {
              if (item.checked) {
                return <Col key={item.value} className="sku-options-detail">
                  <span>{`${formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择'})} ${item.name}:`}</span>
                  <CheckboxGroup
                    defaultValue={
                      item.detailOptions && item.detailOptions
                      .filter((e: NewCheckboxOptionType) => e.checked)
                      .map((e: NewCheckboxOptionType) => e.value)}
                    options={item.detailOptions}
                    onChange={this.selectDetailSkus.bind(this, item.name)}
                  />
                </Col>
              }
              return ''
            })}
            <Table {...tableConfig}/>
          </Row>
        </section>
      </article>
    )
  }
}

export default injectIntl(SkusInfo)
