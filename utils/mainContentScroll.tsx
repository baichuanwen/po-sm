export default function mainContentScroll () {
  const html = document.documentElement as HTMLElement
  const mainContent = document.getElementsByClassName('main-content')[0] as HTMLElement
  const layoutHeader = document.getElementsByClassName('header')[0] as HTMLElement
  const pageFooter = 32 - 32

  mainContent.style['max-height'] =
    html.offsetHeight - layoutHeader.offsetHeight - pageFooter + 'px'
  mainContent.style['overflow-y'] = 'auto'
}
