import React, { Fragment } from 'react';
import dva, { connect } from './dva';
import { Router, Route } from './dva/router'
// 通过执行dva方法胡u哦区区一个dva应用实例
const app = dva();

const delay = (ms) => new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve()
  }, ms)
})

app.model({
  namespace: 'counter', // 命名空间
  state: {number: 2}, // 初始状态
  reducers: { // 处理函数： 传入初始状态，以及action，返回一个新的状态
    add(state, action) {
      console.log(state)
      return { number: state.number+1 }
    }
  },
  effects: {
    *asyncAdd({put, call}) {
      console.log(put, call)
      yield call(delay, 1000); // yield 调用一个delay方法，返回一个promise，会等会这里，等会promise完成返回结果
      yield put({type: 'counter/add'}); // 调用一个action
    }
  }
})
const Counter = connect(
  state => state.counter
)(props => (
  <div>
    <p>{props.number}</p>
    <button onClick={() => props.dispatch({type:'counter/add'})}>add</button>
    <button onClick={() => props.dispatch({type:'counter/asyncAdd'})}>asyncAdd</button>  
  </div>
))
const Home = () => <div>Home</div>
// 配置路由
app.router(({history, app}) => (
  <Router history={history}>
    <Fragment>
      <Route path="/" exact component={Home}/>
      <Route path="/counter" exact component={Counter}/>
    </Fragment>
  </Router>
));

app.start('#root'); // 等价于 ReactDOM.render