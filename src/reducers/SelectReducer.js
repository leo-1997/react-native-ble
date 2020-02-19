import {SELECT_ROW, INITIALIZE_LIST} from '../actions/types';

const INITIAL_STATE = -1;

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SELECT_ROW:
      console.log('inside select reducer action is ', action);
      return action.payload;
    case INITIALIZE_LIST:
      return INITIAL_STATE;
    default:
      return state;
  }
};
