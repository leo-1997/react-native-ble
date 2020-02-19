import {SELECT_ROW} from './types';

export const selectRow = index => {
  return {
    type: SELECT_ROW,
    payload: index,
  };
};
