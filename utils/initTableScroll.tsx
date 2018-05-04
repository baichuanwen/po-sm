/**
 * 设置 table content body的最大高度
 * 获得当前页面的 main-content的 DOM节点
 * 除去 thead, padding, pageFooter
 * 目的是为了页面高度自适应
 */
export default function initTableScroll () {
  const tableScroll = document.getElementsByClassName('ant-table-body')[0] as HTMLElement
  const mianContent = document.getElementsByClassName('main-content')[0] as HTMLElement
  const pageFooter = 64 + 32

  let height = mianContent.offsetHeight - pageFooter - 2

  // 判断 antTabs
  const antTabs = document.getElementsByClassName('ant-tabs')[0] as HTMLElement
  if (antTabs) {
    height -= antTabs.offsetHeight
  }

  // 判断 filterHeader
  const filterHeader = document.getElementsByClassName('filter-header')[0] as HTMLElement
  if (filterHeader) {
    height -= filterHeader.offsetHeight
  }

  // 判断 thead是否存在
  const thead = document.getElementsByTagName('thead')[0] as HTMLElement
  if (thead) {
    height -= thead.offsetHeight
  }

  // 判断 basicInfo 是否存在
  const basicInfo = document.getElementsByClassName('basic-info')[0] as HTMLElement
  if (basicInfo) {
    height -= basicInfo.offsetHeight
  }
  // 判断 goodsHeader 是否存在
  const goodsHeader = document.getElementsByClassName('goods-header')[0] as HTMLElement
  if (goodsHeader) {
    height -= goodsHeader.offsetHeight
  }
  // 判断 goodsRmark 是否存在
  const goodsRmark = document.getElementsByClassName('goods-remark')[0] as HTMLElement
  if (goodsRmark) {
    height -= goodsRmark.offsetHeight
  }

  // 判断 backToPre 是否存在
  const backToPre = document.getElementsByClassName('backto-pre')[0] as HTMLElement
  if (backToPre) {
    height -= backToPre.offsetHeight
  }
  // 判断 operationButton 是否存在
  const operationButton = document.getElementsByClassName('operation-button')[0] as HTMLElement
  if (operationButton) {
    height -= operationButton.offsetHeight
  }

  tableScroll.style['max-height'] = height + 'px'
  tableScroll.style['overflow-x'] = 'auto'
  tableScroll.style['overflow-y'] = 'auto'

  // 判断 firstTableScrollInner 是否存在
  const firstTableScrollInner = document.getElementsByClassName('ant-table-body-inner')[0] as HTMLElement
  if (firstTableScrollInner) {
    firstTableScrollInner.style['max-height'] = height + 'px'
  }
  // 判断 secondTableScrollInner 是否存在
  const secondTableScrollInner = document.getElementsByClassName('ant-table-body-inner')[1] as HTMLElement
  if (secondTableScrollInner) {
    secondTableScrollInner.style['max-height'] = height + 'px'
  }
}
