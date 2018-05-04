/* common reducers --start */
export declare type Func = () => {}

export interface TypeInitialState {
  lang: string
}

export interface DropData {
  id: number | string
  attrName?: string
  name?: string
  cnName?: string
  enName?: string
  value?: number | string
  attrValue?: string | number
}

export interface Action {
  type: string
  lang?: string
  drops?: DropData[]
}

export interface ResData {
  code?: number
  ok?: boolean
  msg?: string
  data?: DropData[]
}
/* common reducers --start */

interface productDrops {
  type?: string
  names?: DropData[]
  category?: DropData[]
  rating?: DropData[]
  spec?: DropData[]
  style?: DropData[]
  tags?: DropData[]
}

export interface ReduxStateProps {
  common?: productDrops[]
}
