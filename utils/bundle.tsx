// /* tslint:disable */
// import * as React from 'react'
//
// interface newState {
//   mod: string
// }
//
// class Bundle extends React.Component {
//   state: newState = {
//     // short for "module" but that's a keyword in js, so "mod"
//     mod: ''
//   }
//
//   // componentWillMount() {
//   //   this.load(this.props)
//   // }
//   //
//   // componentWillReceiveProps(nextProps: any) {
//   //   if (nextProps.load !== this.props.load) {
//   //     console.log(11111)
//   //     this.load(nextProps)
//   //   }
//   // }
//   //
//   // load(props: any) {
//   //   this.setState({
//   //     mod: null
//   //   })
//   //   props.load((mod: any) => {
//   //     this.setState({
//   //       // handle both es imports and cjs
//   //       mod: mod.default ? mod.default : mod
//   //     })
//   //   })
//   // }
//
//   render() {
//     return this.state.mod ? this.props.children(this.state.mod) : ''
//   }
// }
//
// export default Bundle
