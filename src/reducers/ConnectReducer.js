import {
  ADD_BLE,
  CHANGE_STATUS,
  CONNECTED_BLE,
  INITIALIZE_LIST,
  DISCONNECTED_BLE,
  UPDATE_HEARTBEAT,
} from '../actions/types';
import _ from 'lodash';

const INITIAL_STATE = {
  BLEList: [],
  connectedDevice: [],
  heartBeats: [0, 0, 0, 0],
  status: 'disconnected',
};

const BLEReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_BLE:
      const newBLEList = _.uniqBy([...state.BLEList, action.payload], 'id');
      return {
        BLEList: newBLEList,
        connectedDevice: state.connectedDevice,
        heartBeats: state.heartBeats,
        status: state.status,
      };
    case CONNECTED_BLE:
      const newConnectedDevice = [...state.connectedDevice, action.payload];
      return {...state, connectedDevice: newConnectedDevice};
    case DISCONNECTED_BLE:
      return {...state, connectedDevice: []};
    case UPDATE_HEARTBEAT:
      let newHeartBeats = [...state.heartBeats];
      newHeartBeats[action.payload.index] = action.payload.value;
      return {...state, heartBeats: newHeartBeats};
    case CHANGE_STATUS:
      return {...state, status: action.payload};
    case INITIALIZE_LIST:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default BLEReducer;
