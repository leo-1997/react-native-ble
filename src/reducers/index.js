import {combineReducers} from 'redux';
import ConnectReducer from './ConnectReducer';
import SelectReducer from './SelectReducer';

export default combineReducers({
  connect: ConnectReducer,
  select: SelectReducer,
});
