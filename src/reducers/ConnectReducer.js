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
  connectedDevice: {},
  heartBeats: 0,
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
      return {...state, connectedDevice: action.payload};
    case DISCONNECTED_BLE:
      return {...state, connectedDevice: {}};
    case UPDATE_HEARTBEAT:
      return {...state, heartBeats: action.payload};
    case CHANGE_STATUS:
      return {...state, status: action.payload};
    case INITIALIZE_LIST:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default BLEReducer;
