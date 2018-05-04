import * as React from 'react'
import { Card, message } from 'antd'
import { adminAxios, mainContentScroll } from '@Utilities'

import SubCategory from '@Components/SubCategory'
import './index.less'

interface CategoryItem {
  id: number
  level: number
  name: string
  structName: string
  parentId?: number
  productCnt?: number
  attrName?: string
  attrValue?: string
  child?: CategoryItem
}

class SkusManagement extends React.Component {
  // private textInput: HTMLInputElement | null

  state = {
    parentCategory: [],

    create: false,
    createName: '',
  }

  componentDidMount () {
    mainContentScroll()
    addEventListener('resize', mainContentScroll)

    this.getSkuChild().then(res => {
      this.setState({ parentCategory: res })
    })
  }

  getSkuChild = async function () {
    const { data:
      { data: parentCategory }
    } = await adminAxios.get(`/product/attribute/names`)
    const childIds: number[] = parentCategory.map((item: CategoryItem) => item.id)

    let childCategory: CategoryItem[] = []
    for (let childId of childIds) {
      const childCategoryResData = await adminAxios.get(`/product/attribute/values/${childId}`)

      // console.log(childCategoryResData.data.data.map((item: CategoryItem) => ({...item, name: item.attrValue})))
      // console.log(parentCategory.map((item: CategoryItem) => ({...item, name: item.attrName})))

      parentCategory.map((item: CategoryItem) =>
        item.id === childId
        ? item.child = childCategoryResData.data.data
        : item
      )

      childCategory.push(childCategoryResData.data.data)
    }

    const newParentCategory = parentCategory.map((item: CategoryItem) =>
      ({
        ...item,
        name: item.attrName,
        child: Array.isArray(item.child)
          ? item.child.map((e: CategoryItem) => ({...e, name: e.attrValue}))
          : item.child
      })
    )
    return newParentCategory
  }

  createNewCategory = (parentId: number) => {
    if (this.state.createName === '') {
      return this.setState({ create: false })
    }

    adminAxios.post(`/category/${parentId}?name=${this.state.createName}`).then(res => {
      if (!res.data.ok) {
        return message.error(res.data.message)
      }

      this.getSkuChild().then(res => {
        this.setState({
          parentCategory: res,
          create: false,
          createName: '',
        })
      })
      return message.success('创建成功')
    })
  }

  render () {
    return (
      <div className="skus-management">
        <h3 className="title">
          <span>SKU 管理</span>
        </h3>
        <div className="sku-wrapper">
          {this.state.parentCategory.map((category: CategoryItem, index: number) => (
            <Card
              className="category-card"
              title={category.name}
              key={index}
            >
              <SubCategory
                id={category.id}
                child={category.child}
                name={category.name}
                type={'skus'}
              />
            </Card>
          ))}
        </div>
      </div>
    )
  }
}

export default SkusManagement
