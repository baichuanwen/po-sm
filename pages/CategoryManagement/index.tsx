import * as React from 'react'
import { Popconfirm, Card, Button, Input, Icon, message } from 'antd'
import { adminAxios } from '@Utilities'

import SubCategory from '@Components/SubCategory'
import './index.less'

interface CategoryItem {
  id: number
  level: number
  name: string
  structName: string
  parentId?: number
  productCnt?: number
  child?: CategoryItem
}

class CategoryManagement extends React.Component {
  // private textInput: HTMLInputElement | null

  state = {
    parentCategory: [],

    create: false,
    createName: '',
  }

  componentDidMount () {
    this.getCategoryChild().then(res => {
      this.setState({ parentCategory: res })
    })
  }

  getCategoryChild = async function (id = 0) {
    const { data:
      { data: parentCategory }
    } = await adminAxios.get(`/category/${id}`)
    const childIds: number[] = parentCategory.map((item: CategoryItem) => item.id)

    let childCategory: CategoryItem[] = []
    for (let childId of childIds) {
      const childCategoryResData = await adminAxios.get(`/category/${childId}`)

      parentCategory.map((item: CategoryItem) =>
        item.id === childId
        ? item.child = childCategoryResData.data.data
        : item
      )

      childCategory.push(childCategoryResData.data.data)
    }

    return parentCategory
  }

  createNewCategory = (parentId: number) => {
    if (this.state.createName === '') {
      return this.setState({ create: false })
    }

    adminAxios.post(`/category/${parentId}?name=${this.state.createName}`).then(res => {
      if (!res.data.ok) {
        return message.error(res.data.message)
      }

      this.getCategoryChild().then(res => {
        this.setState({
          parentCategory: res,
          create: false,
          createName: '',
        })
      })
      return message.success('创建成功')
    })
  }

  changeCreateStatus = () => {
    this.setState({ create: true })
  }

  changeCreateName = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      createName: (e.target as HTMLInputElement).value
    })
  }

  resetStatus = () => {
    if (this.state.createName === '') {
      return this.setState({ create: false })
    }

    this.setState({ create: false })
  }

  deleteCategory = (id: number) => {
    adminAxios.delete(`/category/${id}`).then(res => {
      if (!res.data.ok) {
        return message.error(res.data.message)
      }

      this.getCategoryChild().then(res => {
        this.setState({
          parentCategory: res,
        })
      })
      return message.success('删除成功')
    })
  }

  render () {
    const { create } = this.state

    return (
      <div className="category-management">
        <h3>
          <span>商品类别</span>
          {!create &&
            <Button type="primary" onClick={this.changeCreateStatus}>新增类别</Button>
          }
          {create &&
            <div className="category-badge create">
              <Input
                style={{width: 100}}
                onChange={this.changeCreateName}
                // onBlur={this.createNewCategory.bind(this, 0)}
              />
              <button onClick={this.createNewCategory.bind(this, 0)}>
                <Icon type="check"/>
              </button>
            </div>
          }
        </h3>
        {this.state.parentCategory.map((category: CategoryItem, index: number) => (
          <Card
            className="category-card"
            title={category.name}
            key={index}
            extra={
              <Popconfirm
                title="确认删除？"
                okText="确定"
                cancelText="取消"
                onConfirm={this.deleteCategory.bind(this, category.id)}
              >
                <Button type="danger">删除</Button>
              </Popconfirm>
            }
          >
            <SubCategory
              id={category.id}
              child={category.child}
              name={category.name}
              type={'category'}
            />
          </Card>
        ))}
      </div>
    )
  }
}

export default CategoryManagement
