import React from 'react';
import {Scene, Router, Actions} from 'react-native-router-flux';
import MainPage from './components/MainPage';
import SelectDevices from './components/SelectDevices';

const RouterComponent = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene
          key="main"
          component={MainPage}
          title="Heartbeat"
          initial
          rightTitle="Select Devices"
          onRight={() => {
            Actions.selectDevices();
          }}
        />
        <Scene
          key="selectDevices"
          title="Select Devices"
          component={SelectDevices}
        />
      </Scene>
    </Router>
  );
};

export default RouterComponent;
