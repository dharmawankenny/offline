import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import axios from 'axios';
import { offline } from 'redux-offline';
import offlineConfig from 'redux-offline/lib/defaults';

import App from './containers/App';
import mainReducer from './reducers';
import { getTodos } from './actions';

import './style';

const customConfig = Object.assign({}, offlineConfig, {
  effect: (effect, action) => {
    return axios({
      method: effect.method,
      url: effect.url,
      data: effect.data,
    }).then(function (res) {
      if (res.statusText === 'OK') {
        return res;
      }
    });
  },
});

const store = createStore(
  mainReducer,
  compose(
    applyMiddleware(logger, thunk),
    offline(customConfig),
  ),
);

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('app')
);

const offlinePluginRuntime = require('offline-plugin/runtime');

offlinePluginRuntime.install({
  onUpdating: () => {
    console.log('SW Event:', 'onUpdating');
  },
  onUpdateReady: () => {
    console.log('SW Event:', 'onUpdateReady');
    // Tells to new SW to take control immediately
    offlinePluginRuntime.applyUpdate();
  },
  onUpdated: () => {
    console.log('SW Event:', 'onUpdated');
    // Reload the webpage to load into the new version
    window.location.reload();
  },
  onUpdateFailed: () => {
    console.log('SW Event:', 'onUpdateFailed');
  },
});
