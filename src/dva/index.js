import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, connect } from 'react-redux'
import createSagaMiddleware from 'redux-saga';
import * as effects from 'redux-saga/effects';
import { createBrowserHistory } from 'history'
const NAMESPACE_SPERATOR = '/'

export {
  connect
}

export default function() {
  let app = {
    model,
    _models: [],
    start,
    _router: [],
    router,

  }
  function model(model) {
    app._models.push(model)
  } 
  function router(routerConfig) {
    app._router = routerConfig; // 把路由暂存起来
  }
  function start(root) { // 启动应用渲染
    console.log(root)
    let reducers = {};
    for(let model of app._models) {
      reducers[model.namespace] = function(state=model.state, action) {
        let actionType = action.type;
        let values = actionType.split(NAMESPACE_SPERATOR);
        if(values[0] === model.namespace) { // 匹配到命名空间，才进来
          let reducer = model.reducers[values[1]] // 获取对应的reducer
          if(reducer) return reducer(state, action)
        }
        return state
      }

    }
    let reducer = combineReducers(reducers )
    let sagaMiddleware = createSagaMiddleware();
    
    function* rootSaga() {
      for(let model of app._models) {
        for(let key in model.effects) {
          yield effects.takeEvery(`${model.namespace}${NAMESPACE_SPERATOR}${key}`, model.effects[key], effects)
        }
      }
    }
    let store = createStore(reducer, applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(rootSaga)
    const history = createBrowserHistory()
    let App = app._router({app, history});
    ReactDOM.render(
      <Provider store={store}>
        {App}
      </Provider>, document.querySelector(root)  
    )
  }
  return app
}