import React, {Component} from 'react';
import {Header} from './src/components/common';
import {Provider} from 'react-redux';
import BleManager from 'react-native-ble-manager';
import store from './src/store';
import MainPage from './src/components/MainPage';

class App extends Component {
  constructor(props) {
    super(props);
    BleManager.start({showAlert: false});
  }

  render() {
    return (
      <Provider store={store}>
        <Header headerText="Heartbeat" />
        <MainPage />
      </Provider>
    );
  }
}

export default App;
