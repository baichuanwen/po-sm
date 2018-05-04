import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { Form, Input, Row, Col, Select, InputNumber, Button, Cascader, message, Tag } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
// import { UploadChangeParam } from 'antd/lib/upload/interface'
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl'
import { EditorState, EditorProps, RawDraftContentState } from 'draft-js'

import QiniuUpload from '@Components/QiniuUpload'
import { axios, hasErrors, getPicSrc, pagesRouter, history, asyncComponent } from '@Utilities'
import { DropData } from '@Redux/d'
import { getProductDropData } from '@Redux/actions/commonAction'

import './index.less'

const SkusInfo = asyncComponent(() => import(
  /* webpackChunkName: "SkusInfo" */'./SkusInfo'
))
const RichEditor = asyncComponent(() => import(
  /* webpackChunkName: "RichEditor" */'@Components/RichEditor'
))
const Ratings = asyncComponent(() => import(
  /* webpackChunkName: "Ratings" */'./Ratings'
))

const { Option } = Select

declare type Func = () => {}

interface UploadContent {
  content: string
  type: string
}

interface ListsUser {
  key: string
  id?: number | string
  name?: string
  weight?: number
  barCode?: string
  properties?: string
  retailPrice?: number
  loading?: boolean
  pagination?: boolean
}

interface NewEditorProps extends EditorProps {
  onChange(editorState: EditorState): void
}

interface NewState extends FormComponentProps {
  loading?: boolean
  enProductName?: string
  enBrandName?: string
  style?: DropData[]
  tags?: DropData[]
  category?: DropData[]
  rating?: DropData[]
  spec?: DropData[]
  names?: DropData[]
  locale?: string
  skusData?: ListsUser[]
  richData?: UploadContent[]
  detail?: RawDraftContentState | undefined | object
}

const FormItem = Form.Item

class GoodsListForm extends React.Component<InjectedIntlProps & NewEditorProps & NewState & DispatchProp<Func>> {
  state = {
    id: undefined,
    loading: false,
    enProductName: '',
    enBrandName: '',

    style: [
      {
        name: 'IPA',
        id: '5694b18c5d432099fc55a6ba',
        value: '5694b18c5d432099fc55a6ba',
        label: 'IPA',
        isLeaf: false,
        loading: false,
        children: [],
      }
    ],
    tags: [
      {
        name: '酒花儿',
        id: 1,
        value: '1',
        label: '酒花儿',
        isLeaf: false,
        loading: false,
      }
    ],
    category: [
      {
        name: 'IPA',
        id: 1,
        value: '1',
        label: '酒花儿',
        isLeaf: false,
        loading: false,
        children: [],
      }
    ],
    spec: [
      {
        name: '350ml',
        id: 1,
        value: 100.00
      },
    ],
    names: [],

    hasSku: false,
    skusData: [{ barCode: '', properties: '', retailPrice: 0 }],
    detail: {},
    richData: [],

    goodsDetail: {
      beerId: undefined,
      categoryId: undefined,
      clientDesc: [],
      cnBrandName: undefined,
      cnName: undefined,
      cnProductName: undefined,
      currency: undefined,
      detail: undefined,
      enBrandName: undefined,
      enName: undefined,
      enProductName: undefined,
      hasSku: false,
      images: [],
      packType: undefined,
      ratings: [],
      skus: [],
      specId: undefined,
      styleId: undefined,
      tagIds: undefined,
      weight: undefined
    }
  }

  /**
   * 设置 table content body的最大高度
   * 获得当前页面的 main-content的 DOM节点
   * 除去 thead, padding, pageFooter
   */
  initTableScroll = () => {
    const html = document.documentElement as HTMLElement
    const createGoods = document.getElementsByClassName('create-goods')[0] as HTMLElement
    const layoutHeader = document.getElementsByClassName('header')[0] as HTMLElement
    const pageFooter = 32

    createGoods.style['max-height'] =
      html.offsetHeight - layoutHeader.offsetHeight - pageFooter + 'px'
    // createGoods.style['overflow-y'] = 'auto'
  }

  /**
   * generate new data
   * 转换级联下拉接口数据
   * 如果是级联选择，添加 isLeaf，loading
   * 如果是商品评分，添加 checked，disable，grade
   */
  generateNewData = (type: string, locale: string, data: DropData[]) => {
    return Array.isArray(data)
      ? data.map(item => {
        // 返回的基础数据
        const basicData = {
          ...item,
          name: item[`${locale === 'zh' ? 'cnName' : 'enName' }`] || item.name || item.attrName,
          label: item[`${locale === 'zh' ? 'cnName' : 'enName' }`] || item.name || item.attrName,
          value: item.id + '',
        }

        // 如果是级联选择，添加 isLeaf，loading
        if (type === 'style' || type === 'category') {
          return {
            ...basicData,
            isLeaf: false,
            loading: false,
          }
        }

        if (type === 'spec') {
          return {
            ...basicData,
            weight: item.value,
          }
        }

        // 如果是商品评分，添加 checked，disable，grade
        if (type === 'ratingsCheckOptions' || type === 'names') {
          return {
            ...basicData,
            checked: false,
            disabled: false,
            grade: undefined,
          }
        }

        return basicData
      })
      : this.state[type]
  }

  componentWillMount () {
    const { dispatch } = this.props
    // tslint:disable-next-line
    dispatch && dispatch(getProductDropData())
    this.updateSelectOptions(this.props)
  }

  componentDidMount () {
    this.initTableScroll()
    addEventListener('resize', this.initTableScroll)
  }

  // tslint:disable-next-line
  componentWillReceiveProps (nextProps: any) {
    /**
     * 当 this.props.names === undefined
     * update updateSelectOptions
     */
    if (!this.props.names) {
      this.updateSelectOptions(nextProps)
    }
  }

  // tslint:disable-next-line
  updateSelectOptions = (nextProps: any) => {
    const {
      intl: { locale },
      style,
      tags,
      category,
      rating,
      spec,
      names,
    } = nextProps

    const { location: { search } } = history
    const id = Number(search.split('=')[1])
    const newState = {
      id: id ? id : undefined,
      style: this.generateNewData('style', locale, style || []),
      tags: this.generateNewData('tags', locale, tags || []),
      category: this.generateNewData('category', locale, category || []),
      ratingsCheckOptions: this.generateNewData('ratingsCheckOptions', locale, rating || []),
      spec: this.generateNewData('spec', locale, spec || []),
      names: this.generateNewData('names', locale, names || []),
    }

    if (id) {
      return this.getGoodsDetail(id, newState)
    }

    this.setState(newState)
  }

  // tslint:disable-next-line
  shouldComponentUpdate (nextProps: any) {
    if (nextProps.names) {
      return true
    }
    // const { location: { search } } = history
    // const id = search.split('=')[1]
    return false
  }

  /**
   * get goods detail
   */
  // tslint:disable-next-line
  getGoodsDetail = (id: number | string, newState: any) => {
    axios.get(`/product/${id}`).then(res => {
      const { data } = res.data
      data.categoryId = data.categoryPid ? [data.categoryPid + '', data.categoryId + ''] : undefined
      data.styleId = data.stylePid ? [data.stylePid, data.styleId] : undefined
      data.currency = data.currency !== '' ? data.currency : undefined
      data.packType = data.packType !== '' ? data.packType : undefined
      data.weight = data.weight !== 0 ? data.weight : undefined
      /**
       * rich editor json data
       */
      data.detail = data.detail !== '{}' && data.detail !== ''
        ? JSON.parse(data.detail)
        : undefined

      /**
       * 获取 cascader 级联数据
       * 根据选择的 parentId，请求接口，加载数据
       * 初始化对应的 children data
       */
      if (data.stylePid) {
        this.loadCascaderData('style', (this.props.style || []).filter(item => item.id === data.stylePid))
      }

      if (data.categoryPid) {
        this.loadCascaderData('category', (this.props.category || []).filter(item => item.id === data.categoryPid))
      }

      this.setState({
        ...newState,
        goodsDetail: data,
        hasSku: data.hasSku,
        skusData: data.skus,
        detail: data.detail,
        richData: JSON.parse(data.clientDesc),
      })
    })
  }

  // // 更新页面高度
  // componentDidUpdate () {
  //   this.initTableScroll()
  // }

  // 卸载方法
  componentWillUnmount () {
    removeEventListener('resize', this.initTableScroll)
  }

  /**
   * 自动拼接英文名称
   */
  updateEnglishName = (name: string, e: React.SyntheticEvent<HTMLInputElement>): void => {
    const {
      form: { setFieldsValue },
    } = this.props
    const { enProductName, enBrandName } = this.state

    this.setState({ [name]: (e.target as HTMLInputElement).value })

    if (name === 'enProductName') {
      setFieldsValue({ enName: `${(e.target as HTMLInputElement).value} ${enBrandName}`})
    } else {
      setFieldsValue({ enName: `${enProductName} ${(e.target as HTMLInputElement).value}`})
    }
  }

  /**
   * cascader change
   * 获取 cascader 级联数据
   * 根据选择的 parentId，请求接口，加载数据
   */
  // tslint:disable-next-line
  loadCascaderData = (type: string, selectedOptions: any[]) => {
    const { intl: { locale } } = this.props
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption.loading = true

    const params = { parentId: selectedOptions[0].id }
    axios.get(`product/${type}`, { params }).then(res => {
      targetOption.loading = false
      const { data } = res.data
      targetOption.children = Array.isArray(data)
        && data.map(item => ({
          ...item,
          name: item[`${locale === 'zh' ? 'cnName' : 'enName' }`] || item.name || item.attrName,
          enName: item.enName || item.name,
          cnName: item.cnName || item.name,
          label: item.cnName || item.name,
          value: item.id + '',
          isLeaf: true,
          loading: false,
        }))

      // tslint:disable-next-line
      const newCascaderData = this.state[type].map((item: any) => {
        if (item.id === selectedOptions[0].id) {
          return {
            ...item,
            children: targetOption.children
          }
        }
        return item
      })
      this.setState({ [type]: newCascaderData })
    })
  }

  /**
   * 每次图片数量更新
   * 校验图片数量是否大于 0
   * 若大于 0，则取消爆红操作
   */
  // updateUrls = ({fileList}: UploadChangeParam) => {
  //   this.setState({ fileUrls: (fileList || []).map(item => {
  //     return `${item.response.url}|${item.response.w}|${item.response.h}`
  //   })})
  // }

  /**
   * 选择规格类型，更新 goods weight的初始值
   */
  // tslint:disable-next-line
  selectSpec = (value: any) => {
    // console.log(value)
    const {
      form: {
        setFieldsValue,
      },
    } = this.props

    // console.log(this.state.spec)
    const specWeight: Array<number | undefined> = this.state.spec.filter((item) => item.id === value)
      // tslint:disable-next-line
      .map((item: any) => item.weight)
    // console.log(specWeight)
    setFieldsValue({ 'weight': specWeight[0]})
  }

  /**
   * upload SkusInfo table data
   */
  uploadSkuData = (hasSku: boolean, skusData: ListsUser[]) => {
    // console.log(skusData)
    this.setState({
      hasSku: hasSku,
      skusData: skusData
    })
  }

  /**
   * upload rich data
   */
  uploadRichEditorData = (content: RawDraftContentState, richData: UploadContent[]) => this.setState({
    detail: content,
    richData: richData,
  })

  // tslint:disable-next-line
  submitForm = (): any => {
    const {
      form: {
        getFieldsValue,
        validateFieldsAndScroll,
        getFieldsError,
      },
      intl: { formatMessage },
    } = this.props

    validateFieldsAndScroll()
    if (hasErrors(getFieldsError())) {
      return message.error(
        formatMessage({
          id: 'Login.formWarningMes',
          defaultMessage: '表单填写有误，请仔细检查表单'
        })
      )
    }

    // tslint:disable-next-line
    const formData: any = getFieldsValue()
    // tslint:disable-next-line
    const hasUndefined = formData.ratings.map((item: any) => item.value).findIndex((e: any) => e === undefined) > -1
    if (hasUndefined) {
      return message.error(
        formatMessage({
          id: 'CreateGoods.ratingRequired',
          defaultMessage: '请填写评分'
        })
      )
    }

    this.createOrEditGoods(getFieldsValue())
  }

  // tslint:disable-next-line
  createOrEditGoods = (formData: any): any => {
    const {
      intl: { formatMessage },
    } = this.props
    const params = {
      beerId: formData.beerId ? formData.beerId : '',
      categoryId: formData.categoryId ? formData.categoryId[1] - 0 : '',
      clientDesc: this.state.richData,

      cnBrandName: formData.cnBrandName ? formData.cnBrandName : '',
      cnName: formData.cnName ? formData.cnName : '',
      cnProductName: formData.cnProductName ? formData.cnProductName : '',
      currency: formData.currency ? formData.currency : '',

      detail: this.state.detail ? JSON.stringify(this.state.detail) : '',
      enBrandName: formData.enBrandName ? formData.enBrandName : '',
      enName: formData.enName ? formData.enName : '',
      enProductName: formData.enProductName ? formData.enProductName : '',
      hasSku: this.state.hasSku,

      images: formData.images,
      packType: formData.packType ? formData.packType : '',
      ratings: formData.ratings,
      skus: this.state.skusData,
      specId: formData.specId ? formData.specId - 0 : '',
      styleId: formData.styleId ? formData.styleId[1] : '',
      tagIds: formData.tagIds ? formData.tagIds : [],
      weight: formData.weight ? formData.weight : 0,
    }

    this.setState({ loading: true })
    if (this.state.id) {
      axios.put(`/product/${this.state.id}`, params).then(res => {
        const { data } = res
        this.setState({ loading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'CreateGoods.editGoodsSuccess',
              defaultMessage: '商品编辑成功'
            })
          )
          setTimeout(() => history.push(pagesRouter.GoodsList), 800)
        }
      }).catch(res => { this.setState({ loading: false }) })
    } else {
      axios.post('/product', params).then(res => {
        const { data } = res
        this.setState({ loading: false })
        if (data.code === 0) {
          message.success(
            formatMessage({
              id: 'CreateGoods.createGoodsSuccess',
              defaultMessage: '商品创建成功'
            })
          )
          setTimeout(() => history.push(pagesRouter.GoodsList), 800)
        }
      }).catch(res => { this.setState({ loading: false }) })
    }
  }

  render() {
    const {
      form: {
        getFieldDecorator,
      },
      intl,
      rating,
      intl: { formatMessage },
    } = this.props

    const {
      location: { pathname, search }
    } = history

    const goodsInfoFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 6, xl: 4},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 8},
    }
    const picLayout = {
      labelCol: {sm: 9, md: 9, lg: 6, xl: 4},
      wrapperCol: {sm: 15, md: 15, lg: 15, xl: 20},
    }
    const goodsDetailFormLayout = {
      labelCol: {sm: 9, md: 9, lg: 6, xl: 8},
      wrapperCol: {sm: 15, md: 15, lg: 18, xl: 16},
    }
    const detailInfoCol = { sm: 24, md: 24, lg: 24, xl: 12 }

    const { goodsDetail } = this.state

    const ratingsConfig = {
      intl: intl,
      rating: rating,
    }

    const SkuConfig = {
      intl: intl,
      id: this.state.id,
      hasSku: goodsDetail.hasSku,
      names: this.state.names,
      skus: goodsDetail.skus,
      uploadData: this.uploadSkuData
    }

    const richEditorConfig = {
      intl: intl,
      initialValue: goodsDetail.detail,
      uploadRichEditorData: this.uploadRichEditorData,
    }

    return (
      <div className="create-goods" id="createGoods">
        <Form onSubmit={this.submitForm}>
          <article className="goods-info">
            <h3>{formatMessage({ id: 'CreateGoods.goodsInfo', defaultMessage: '商品信息'})}</h3>
            <section className="goods-info-form">
              <FormItem
                {...goodsInfoFormLayout}
                label={<FormattedMessage id={'CreateGoods.enProductName'}/>}
                className="enProductName"
              >
                {!pathname.includes('view')
                  ? getFieldDecorator('enProductName', {
                    initialValue: goodsDetail.enProductName,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage({ id: 'CreateGoods.enProductNameRequire', defaultMessage: '请输入英文品名' })
                      }
                    ],
                  })(
                    <Input
                      onChange={this.updateEnglishName.bind(this, 'enProductName')}
                      placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                    />
                  )
                  : <span>{goodsDetail.enProductName}</span>
                }
              </FormItem>

              <FormItem
                {...goodsInfoFormLayout}
                label={<FormattedMessage id={'CreateGoods.enBrandName'}/>}
                className="enBrandName"
              >
                {!pathname.includes('view')
                  ? getFieldDecorator('enBrandName', {
                    initialValue: goodsDetail.enBrandName,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage({ id: 'CreateGoods.enBrandNameRequire', defaultMessage: '请输入英文品牌' })
                      }
                    ],
                  })(
                    <Input
                      onChange={this.updateEnglishName.bind(this, 'enBrandName')}
                      placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                    />
                  )
                  : <span>{goodsDetail.enBrandName}</span>
                }
              </FormItem>

              <FormItem
                {...goodsInfoFormLayout}
                label={<FormattedMessage id={'CreateGoods.enName'}/>}
                className="enName"
              >
                {!pathname.includes('view')
                  ? getFieldDecorator('enName', {
                    initialValue: goodsDetail.enName,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: formatMessage({ id: 'CreateGoods.enNameRequire', defaultMessage: '请输入英文名称' })
                      }
                    ],
                  })(
                    <Input placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}/>
                  )
                  : <span>{goodsDetail.enName}</span>
                }
              </FormItem>

              {/**
                * 加载 upload 组件的时机的控制
                * 当路由中 search === ''，也就是 create goods的时候渲染组件
                * 或者当路由中 search !== '' && id 存在，即详情数据返回之后，edit goods才渲染组件
                * 这样是为了保证在编辑商品的时候
                * 初始化数据能够在 upload组件 componentDidMount时初始化照片数据
                */
              }
              {((search === '') || (search && this.state.id)) &&
                <FormItem
                  {...picLayout}
                  label={<FormattedMessage id={'CreateGoods.goodsPic'}/>}
                  className={!pathname.includes('view') ? 'goodsPic' : ''}
                >
                  {!pathname.includes('view')
                   ? getFieldDecorator('images', {
                      initialValue: goodsDetail.images,
                      // validateTrigger: 'onBlur',
                      rules: [
                        {
                          required: true,
                          message: formatMessage({ id: 'CreateGoods.goodsPicRequire', defaultMessage: '请上传商品主图' })
                        }
                      ],
                    })(
                      <QiniuUpload
                        count={10}
                        imagesUrls={goodsDetail.images}
                      />
                    )
                    : (goodsDetail.images || []).map(item =>
                        <div key={item} className="goodsPic-image">
                          <img src={getPicSrc(item)}/>
                        </div>
                      )
                  }
                </FormItem>
              }
            </section>

            {/* goods detail info */}
            <section className="goods-detail-info">
              <Row>
                <Col {...detailInfoCol}>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.cnName'}/>}
                    className="cnName"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('cnName', {
                        initialValue: goodsDetail.cnName,
                        validateTrigger: 'onBlur',
                      })(
                        <Input placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}/>
                      )
                      : <span>{goodsDetail.cnName}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.cnBrandName'}/>}
                    className="cnBrandName"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('cnBrandName', {
                        initialValue: goodsDetail.cnBrandName,
                        validateTrigger: 'onBlur',
                      })(
                        <Input placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}/>
                      )
                      : <span>{goodsDetail.cnBrandName}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.cnProductName'}/>}
                    className="cnProductName"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('cnProductName', {
                        initialValue: goodsDetail.cnProductName,
                        validateTrigger: 'onBlur',
                      })(
                        <Input placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}/>
                      )
                      : <span>{goodsDetail.cnProductName}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.beerId'}/>}
                    className="beerId"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('beerId', {
                        initialValue: goodsDetail.beerId,
                        validateTrigger: 'onBlur',
                      })(
                        <Input placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}/>
                      )
                      : <span>{goodsDetail.beerId}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.currency'}/>}
                    className="currency"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('currency', {
                        initialValue: goodsDetail.currency,
                        validateTrigger: 'onBlur',
                      })(
                        <Select
                          // tslint:disable-next-line
                          getPopupContainer={(): any => document.getElementById('createGoods')}
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                        >
                          <Option value="美元">美元</Option>
                          <Option value="人民币">人民币</Option>
                        </Select>
                      )
                      : <span>{goodsDetail.currency}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.styleId'}/>}
                    className="styleId"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('styleId', {
                        initialValue: goodsDetail.styleId,
                        validateTrigger: 'onBlur',
                      })(
                        <Cascader
                          // tslint:disable-next-line
                          getPopupContainer={(): any => document.getElementById('createGoods')}
                          loadData={this.loadCascaderData.bind(this, 'style')}
                          options={this.state.style}
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                        />
                      )
                      /**
                       * 根据 initial value
                       * 找到父 id的那一项
                       * 根据子 id找到对应的 children 项
                       * 渲染对应的 name
                       */
                      : (goodsDetail.styleId || []).map((item, index, arr) => {
                        const pos = (this.state.style || []).findIndex(e => e.id === item)
                        if (pos > -1) {
                          // tslint:disable-next-line
                          const childrenOptions: any[] = this.state.style[pos].children
                          const childPos = (childrenOptions || [])
                          // tslint:disable-next-line
                            .findIndex((chidStyle: any) => chidStyle.id === arr[index + 1])
                          if (childPos > -1) {
                            return [
                              <span key={`parent${item}`}>{`${this.state.style[pos].name} / `}</span>,
                              <span key={`child${item}`}>{childrenOptions[childPos].name}</span>,
                            ]
                          }
                          return ''
                        }
                        return ''
                      })
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.specId'}/>}
                    className="specId"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('specId', {
                        initialValue: goodsDetail.specId,
                        validateTrigger: 'onBlur',
                      })(
                        <Select
                          // tslint:disable-next-line
                          getPopupContainer={(): any => document.getElementById('createGoods')}
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                          onChange={this.selectSpec}
                        >
                          {this.state.spec.map((item, index) =>
                            <Option key={index} value={item.id}>{item.name}</Option>
                          )}
                        </Select>
                      )
                      // tslint:disable-next-line
                      : this.state.spec.map((item: any) => {
                        if (item.id === goodsDetail.specId) {
                          return <span key={item}>{item.name}</span>
                        }
                        return ''
                      })
                    }
                  </FormItem>
                </Col>
                <Col {...detailInfoCol}>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.packType'}/>}
                    className="packType"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('packType', {
                        initialValue: goodsDetail.packType,
                        validateTrigger: 'onBlur',
                      })(
                        <Select
                          // tslint:disable-next-line
                          getPopupContainer={(): any => document.getElementById('createGoods')}
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                        >
                          <Option value="易拉罐">易拉罐</Option>
                          <Option value="瓶">瓶</Option>
                          <Option value="其他">其他</Option>
                        </Select>
                      )
                      : <span>{goodsDetail.packType}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.weight'}/>}
                    className="weight"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('weight', {
                        initialValue: goodsDetail.weight,
                        validateTrigger: 'onBlur',
                      })(
                        <InputNumber
                          min={0}
                          placeholder={formatMessage({ id: 'pleaseInput', defaultMessage: '请输入' })}
                        />
                      )
                      : <span>{goodsDetail.weight}</span>
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.categoryId'}/>}
                    className="categoryId"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('categoryId', {
                          initialValue: goodsDetail.categoryId,
                          validateTrigger: 'onBlur',
                        })(
                          <Cascader
                            // tslint:disable-next-line
                            getPopupContainer={(): any => document.getElementById('createGoods')}
                            loadData={this.loadCascaderData.bind(this, 'category')}
                            options={this.state.category}
                            placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                          />
                        )
                      /**
                       * 根据 initial value
                       * 找到父 id的那一项
                       * 根据子 id找到对应的 children 项
                       * 渲染对应的 name
                       */
                      : (goodsDetail.categoryId || []).map((item, index, arr) => {
                        const pos = (this.state.category || []).findIndex(e => `${e.id}` === `${item}`)
                        if (pos > -1) {
                          // tslint:disable-next-line
                          const childrenOptions: any[] = this.state.category[pos].children
                          const childPos = (childrenOptions || [])
                          // tslint:disable-next-line
                            .findIndex((chidStyle: any) => `${chidStyle.id}` === `${arr[index + 1]}`)
                          if (childPos > -1) {
                            return [
                              <span key={`parent${item}`}>{`${this.state.category[pos].name} / `}</span>,
                              <span key={`child${item}`}>{childrenOptions[childPos].name}</span>,
                            ]
                          }
                          return ''
                        }
                        return ''
                      })
                    }
                  </FormItem>
                  <FormItem
                    {...goodsDetailFormLayout}
                    label={<FormattedMessage id={'CreateGoods.tagIds'}/>}
                    className="tagIds"
                  >
                    {!pathname.includes('view')
                      ? getFieldDecorator('tagIds', {
                        initialValue: goodsDetail.tagIds,
                        validateTrigger: 'onBlur',
                      })(
                        <Select
                          mode="multiple"
                          // tslint:disable-next-line
                          getPopupContainer={(): any => document.getElementById('createGoods')}
                          placeholder={formatMessage({ id: 'pleaseSelect', defaultMessage: '请选择' })}
                        >
                          {this.state.tags.map((item, index) =>
                            <Option key={index} value={item.id}>{item.name}</Option>
                          )}
                        </Select>
                      )
                      : (goodsDetail.tagIds || []).map((item) => {
                        const pos = this.state.tags.findIndex(e => e.id === item)
                        if (pos > -1) {
                          return <Tag key={item}>{this.state.tags[pos].name}</Tag>
                        }
                        return ''
                      })
                    }
                  </FormItem>

                  {/**
                    * 加载 upload 组件的时机的控制
                    * 当路由中 search === ''，也就是 create goods的时候渲染组件
                    * 或者当路由中 search !== '' && id 存在，即详情数据返回之后，edit goods才渲染组件
                    * 这样是为了保证在编辑商品的时候
                    * 初始化数据能够在 upload组件 componentDidMount时初始化照片数据
                    */
                  }
                  {((search === '') || (search && this.state.id)) &&
                    <FormItem
                      {...goodsDetailFormLayout}
                      label={<FormattedMessage id={'CreateGoods.ratings'}/>}
                      className="ratings"
                    >
                      {getFieldDecorator('ratings', {
                        initialValue: goodsDetail.ratings,
                        validateTrigger: 'onBlur',
                      })(
                        <Ratings {...ratingsConfig}/>
                      )}
                    </FormItem>
                  }
                </Col>
              </Row>
            </section>
          </article>

          {
            /**
             * 当 names数组的长度 > 0, 开始加载 SkusInfo component
             */
          }
          {this.state.names.length > 0 &&
            <SkusInfo
              {...SkuConfig}
            />
          }

          <article className="goods-detail-info">
            <h3>{formatMessage({ id: 'CreateGoods.goodsInfo', defaultMessage: '商品信息'})}</h3>
            {this.state.names.length > 0 &&
              <RichEditor {...richEditorConfig}/>
            }
          </article>

          {!pathname.includes('view') &&
            <Button
              loading={this.state.loading}
              disabled={this.state.loading}
              type="primary"
              onClick={this.submitForm}
            >
            {formatMessage({ id: 'CreateGoods.save', defaultMessage: '保存'})}
            </Button>
          }
        </Form>
      </div>
    )
  }
}

// tslint:disable-next-line
const mapStateToProps = (state: any) => {
  const {
    productDrops
  } = state.common
  return {...productDrops}
}

const GoodsList = Form.create<{}>()(GoodsListForm)

export default injectIntl(connect(mapStateToProps)(GoodsList))
