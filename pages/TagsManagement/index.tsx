import * as React from 'react'
import { adminAxios } from '@Utilities'

import SubCategory from '@Components/SubCategory'
import './index.less'

interface CategoryItem {
  id: number
  name: string
  level?: number
  structName?: string
  parentId?: number
  productCnt?: number
  child?: CategoryItem
}

class TagsManagement extends React.Component<{} & CategoryItem> {
  // private textInput: HTMLInputElement | null

  state = {
    parentCategory: [],
  }

  componentDidMount () {
    this.getCategoryChild()
  }

  getCategoryChild = (page = 0, size = 100) => {
    adminAxios.get(`/productTag?page=${page}&size=${size}`).then(res => {
      const { data:
        { data: { content } }
      } = res
      this.setState({ parentCategory: [content] })
    })
  }

  render () {
    return (
      <div className="tags-management">
        <h3>
          <span>商品标签</span>
        </h3>
        <div className="tags-list">
          {this.state.parentCategory.map((category: CategoryItem, index: number) =>
            <SubCategory
              key={index}
              id={0}
              child={category}
              name={''}
              type={'productTag'}
            />
          )}
        </div>
      </div>
    )
  }
}

export default TagsManagement
