export interface ProductsProps {
  barCode: string
  id: number
  skuId?: number
  mainPic: string
  name: string
  price?: number | undefined
  quantity?: number | undefined
  skuName: string
  structName: string
}
