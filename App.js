import React, {Component} from 'react';
import Router from './src/Router';
import {Provider} from 'react-redux';
import BleManager from 'react-native-ble-manager';
import store from './src/store';

class App extends Component {
  constructor(props) {
    super(props);
    BleManager.start({showAlert: false});
  }

  render() {
    return (
      <Provider store={store}>
        <Router />
      </Provider>
    );
  }
}

export default App;
