import * as React from 'react'
import { Popconfirm, Badge, Icon, Input, message } from 'antd'
import { adminAxios } from '@Utilities'

import './index.less'

interface CategoryItem {
  id: number
  name: string
  type?: string
  parentId?: number
  productCnt?: number
  child?: CategoryItem
  edit?: boolean
}

class SubCategory extends React.Component<{} & CategoryItem> {
  state = {
    child: [],
    editSubName: '',
    editSubId: -1,
  }

  componentDidMount () {
    const { child, id: parentId } = this.props
    const createChild: any[] = [{
      edit: false,
      id: -1,
			name: '新增子类别',
			parentId: parentId,
    }]
    const newChild = Array.isArray(child) && child.map((item: CategoryItem) => ({...item, edit: false}))

    this.setState({
      child: createChild.concat(newChild)
    })
  }

  /**
   * 当 id === -1 也就是新建子类别的时候
   * editSubName 值为空
   */
  editSubCategory = (id: number, name: string) => {
    this.setState({
      child: this.state.child.map((item: CategoryItem) =>
        ({...item, edit: item.id === id ? true : false})
      ),
      editSubName: id === -1 ? '' : name,
      editSubId: id,
    })
  }

  changeSubCategoryName = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      editSubName: (e.target as HTMLInputElement).value
    })
  }

  // 确定修改 SubCategory Name
  confirmSubCategoryName = (id: number, parentId: number) => {
    if (this.state.editSubName === '') {
      return this.setState({
        child: this.state.child.map((item: CategoryItem) =>
          ({...item, edit: false })
        )
      })
    }

    /**
     * 创建商品的时候，根据传入的type
     * 选择不同的 url，调用不同的接口
     */
    if (id === -1) {
      let url = ''
      if (this.props.type === 'productTag') {
        url = `/${this.props.type}?name=${this.state.editSubName}`
      }

      if (this.props.type === 'category') {
        url = `/${this.props.type}/${parentId}?name=${this.state.editSubName}`
      }

      if (this.props.type === 'skus') {
        // product/attribute/values/1
        url = `/product/attribute/values/${parentId}?value=${this.state.editSubName}`
      }

      return adminAxios.post(url).then(res => {
        if (!res.data.ok) {
          return message.error(res.data.message)
        }

        message.success('创建成功')

        return this.setState({
          child: this.state.child.map((item: CategoryItem) =>
            ({...item, edit: false })
          ).concat([{
            ...res.data.data,
            name: res.data.data.name ? res.data.data.name : res.data.data.attrValue,
            edit: false
          }])
        })
      })
    }

    return adminAxios.put(`/${this.props.type}/${id}?name=${this.state.editSubName}`).then(res => {
      if (!res.data.ok) {
        return message.error(res.data.message)
      }

      message.success('修改成功')
      return this.setState({
        child: this.state.child.map((item: CategoryItem) =>
          ({...item, edit: false, name: item.id === id ? this.state.editSubName : item.name})
        )
      })
    })
  }

  deleteCategory = (id: number) => {
    adminAxios.delete(`/${this.props.type}/${id}`).then(res => {
      if (!res.data.ok) {
        return message.error(res.data.message)
      }

      message.success('删除成功')
      return this.setState({
        child: this.state.child.filter((item: CategoryItem) => item.id !== id)
      })
    })
  }

  resetStatus = () => {
    this.setState({
      child: this.state.child.map((item: CategoryItem) =>
        ({...item, edit: false})
      )
    })
  }

  render () {
    const { child } = this.state

    if (this.props.type === 'skus') {
      return (
        <>
          {Array.isArray(child) && child.map(({ edit, name, id, parentId }: CategoryItem, index: number) =>
            <Badge key={`${name}${index}`} className="category-badge">
              {!edit &&
                <>
                  {index === 0 &&
                    <>
                      <span onClick={this.editSubCategory.bind(this, id, name)}>{name}</span>
                      <button onClick={this.editSubCategory.bind(this, id, name)}>
                        <Icon type="plus"/>
                      </button>
                    </>
                  }

                  {index > 0 &&
                    <span>{name}</span>
                  }
                </>
              }

              {edit && index === 0 &&
                <>
                  <Input
                    defaultValue={id === -1 ? '' : name}
                    style={{width: 100}}
                    onChange={this.changeSubCategoryName}
                    // onBlur={this.resetStatus}
                  />
                  <button onClick={this.confirmSubCategoryName.bind(this, id, parentId)}>
                    <Icon type="check" />
                  </button>
                </>
              }
            </Badge>
          )}
        </>
      )
    } else {
      return (
      <>
        {Array.isArray(child) && child.map(({ edit, name, id, parentId }: CategoryItem, index: number) =>
          <Badge key={`${name}${index}`} className="category-badge">
            {index > 0 &&
              <Popconfirm
                title="确认删除？"
                okText="确定"
                cancelText="取消"
                onConfirm={this.deleteCategory.bind(this, id)}
              >
                <button className="delete-category"><Icon type="close"/></button>
              </Popconfirm>
            }
            {!edit &&
              <>
                <span onClick={this.editSubCategory.bind(this, id, name)}>{name}</span>
                <button onClick={this.editSubCategory.bind(this, id, name)}>
                  {index === 0 && <Icon type="plus"/>}
                  {index > 0 && <Icon type="edit"/>}
                </button>
              </>
            }
            {edit &&
              <>
                <Input
                  defaultValue={id === -1 ? '' : name}
                  style={{width: 100}}
                  onChange={this.changeSubCategoryName}
                  // onBlur={this.resetStatus}
                />
                <button onClick={this.confirmSubCategoryName.bind(this, id, parentId)}>
                  <Icon type="check" />
                </button>
              </>
            }
          </Badge>
        )}
      </>
    )
    }
  }
}

export default SubCategory
