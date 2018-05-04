/**
 * store
 */
import {
  createStore,
  applyMiddleware,
  // compose,
} from 'redux'
import thunk from 'redux-thunk'
import reducers from '@Redux/reducers'

declare global {
  interface Window { devToolsExtension: () => {} }
}
// declare function compose(a: any, b: any): any

// const devTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
// ? window.devToolsExtension()
// : (f: any) => f

// const createStoreWithMiddleware = compose(
//   applyMiddleware(thunk),
//   devTools,
// )(createStore)
// export default createStoreWithMiddleware(reducers)

/* tslint:disable */
const initialState = {}
/**
 * if NODE_ENV === 'development'
 * open the redux dev tools
 */
const devtools: any = window.devToolsExtension && process.env.NODE_ENV === 'development'
  ? window.devToolsExtension()
  : (f: any) => f
const middleware = applyMiddleware(thunk)
const store: any = middleware(devtools(createStore))(reducers, initialState)
export default store
