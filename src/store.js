import {createStore, applyMiddleware} from 'redux';
import reducers from './reducers';
import ReduxThunk from 'redux-thunk';
import BleManager from 'react-native-ble-manager';

export default createStore(
  reducers,
  {},
  applyMiddleware(ReduxThunk.withExtraArgument(BleManager)),
);
