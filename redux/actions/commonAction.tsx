import { Dispatch } from 'redux'
// import { AxiosResponse } from 'axios'
// import { ThunkAction } from 'redux-thunk'
import { axios } from '@Utilities'
import * as actionTypes from '@Redux/actionTypes/commonActionType'
import { Func, ResData, DropData } from '@Redux/d'

// // 点击 table row, 弹出 Dock
// export const changeLanguage = (lang: string) => (
//   {
//     type: actionTypes.CHANGE_LANGUAGE,
//     lang: lang === 'en' ? 'zh' : 'en'
//   }
// )

/* tslint:disable */
const getProductDrop = (json: any[]) => ({
  type: actionTypes.GET_PRODUCT_DROP_VALUES,
  names: json[0].data,
  category: json[1].data,
  rating: json[2].data,
  spec: json[3].data,
  style: json[4].data,
  tags: json[5].data,
})
// 请求队列
const requestList = [
  axios.get('/product/attribute/names'),
  axios.get('/product/category'),
  axios.get('/product/rating'),
  axios.get('/product/spec'),
  axios.get('/product/style'),
  axios.get('/product/tags'),
]
export const getProductDropData = () => (dispatch: Dispatch<Func>) =>
  Promise.all(requestList).then((res: ResData[]) => {
    dispatch(getProductDrop(res.map((item: ResData): DropData[] => item.data || [])))
  })
