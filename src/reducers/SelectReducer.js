import {SELECT_ROW, INITIALIZE_LIST} from '../actions/types';

const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SELECT_ROW:
      return [...state, action.payload];
    case INITIALIZE_LIST:
      return INITIAL_STATE;
    default:
      return state;
  }
};
