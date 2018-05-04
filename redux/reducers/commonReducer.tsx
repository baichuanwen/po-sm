// import { Action, ActionCreator, Dispatch } from 'redux'
import { combineReducers } from 'redux'
import * as actionTypes from '@Redux/actionTypes/commonActionType'
import { Action } from '@Redux/d'

// const initialState: TypeInitialState = {
//   lang: 'en'
// }
//
// // language change
// const changeLang = (state = initialState, action: Action) => {
//   switch (action.type) {
//     case actionTypes.CHANGE_LANGUAGE:
//       return {
//         ...state,
//         lang: action.lang,
//       }
//
//     default:
//       return state
//   }
// }

const productDrops = (state = [], action: Action) => {
  switch (action.type) {
    case actionTypes.GET_PRODUCT_DROP_VALUES:
      return {
        ...state,
        ...action
      }

    default:
      return state
  }
}

const common = combineReducers({
  // changeLang,
  productDrops,
})

export default common
