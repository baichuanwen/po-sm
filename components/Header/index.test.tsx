import * as React from 'react'
// import { ReactInstance } from 'react'
// import * as ReactDOM from 'react-dom'
import * as TestUtils from 'react-dom/test-utils'
import { ReactTestRenderer } from 'react-test-renderer'

import Header from '@Components/Header'
import createComponentWithIntl, { createComponent } from '@Utilities/test.utils'

/**
 * snapshot the whole Component
 */
describe('Header test with snapshot', () => {
  const Compo: ReactTestRenderer = createComponentWithIntl(<Header />)
  let tree: any = Compo.toJSON()

  const HeaderRight = tree.children[1]
  const Button = HeaderRight.children[0]

  // console.log(Compo.root)
  console.log(Compo.root.findByProps({className: 'right'}))
  // console.log(Compo.root.type)
  /**
   * snapshot header
   * children.length === 2
   */
  test('test header COMP', () => {
    expect(Compo.root.props.locale).toBe('en')

    expect(tree.props.className).toEqual('header')
    expect(tree.children.length).toBe(2)
    expect(tree).toMatchSnapshot()

    Button.props.onClick()
    tree = Compo.toJSON()
    expect(tree).toMatchSnapshot()
  })

  /**
   * button test
   */
  test('test header change lang button', () => {
    expect(Button.type).toBe('button')
    expect(Button.props.onClick).toBeInstanceOf(Function)
  })
})

/**
 * DOM testing Header
 */
describe('works with DOM Testing', () => {
  // expect.assertions(1)
  const HeaderComp = createComponent(<Header />)
  const Compo: any = TestUtils.renderIntoDocument(HeaderComp)
  // console.log(Compo)
  // const HeaderNode = ReactDOM.findDOMNode(Compo)
  // console.log(HeaderNode)

  const HeaderLeft = TestUtils.findRenderedDOMComponentWithClass(Compo, 'ant-breadcrumb')
  const HeaderRight = TestUtils.findRenderedDOMComponentWithClass(Compo, 'right')
  const HeaderButton = TestUtils.scryRenderedDOMComponentsWithTag(Compo, 'button')

  test('test header change lang button', () => {
    expect(TestUtils.isElement(HeaderComp)).toBeTruthy()
    // expect(HeaderComp).toContain('right')
    expect(HeaderLeft).toBeTruthy()
    expect(HeaderRight).toBeTruthy()
    expect(HeaderButton).toBeTruthy()
    // expect(TestUtils.isDOMComponent(Header)).toBeTruthy()
  })
})
