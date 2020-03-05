import {
  ADD_BLE,
  CHANGE_STATUS,
  CONNECTED_BLE,
  DISCONNECTED_BLE,
  INITIALIZE_LIST,
  UPDATE_HEARTBEAT,
} from './types';

export const initializeList = () => {
  return {
    type: INITIALIZE_LIST,
  };
};

export const startScan = () => {
  console.log('scanning');
  return (dispatch, getSate, BleManager) => {
    dispatch(scan());
  };
};

export const scan = () => {
  return (dispatch, getState, BleManager) => {
    BleManager.scan([], 20, false).then(() =>
      dispatch(changeStatus('scanning')),
    );
  };
};

export const stopScan = () => {
  return (dispatch, getState, BleManager) => {
    BleManager.stopScan().then(() => {
      dispatch(changeStatus('disconnected'), dispatch(initializeList()));
    });
  };
};

export const addBLE = device => {
  return {
    type: ADD_BLE,
    payload: device,
  };
};

export const changeStatus = status => {
  return {
    type: CHANGE_STATUS,
    payload: status,
  };
};

export const toConnectBle = id => {
  return (dispatch, getState, BleManager) => {
    BleManager.connect(id);
    dispatch(changeStatus('connecting'));
  };
};

export const bleConnected = id => {
  return (dispatch, getState, BleManager) => {
    dispatch(changeStatus('connected'));
    dispatch({type: CONNECTED_BLE, payload: id});
  };
};

export const toDisconnectBle = id => {
  return (dispatch, getState, BleManager) => {
    BleManager.disconnect(id);
    dispatch(changeStatus('disconnecting'));
  };
};

export const bleDisconnected = id => {
  return (dispatch, getState, BleManager) => {
    dispatch(changeStatus('disconnected'));
    dispatch({type: DISCONNECTED_BLE, payload: id});
  };
};

export const updateHeartBeat = ({value, index}) => {
  return {
    type: UPDATE_HEARTBEAT,
    payload: {value, index},
  };
};
