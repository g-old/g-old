import { combineReducers } from 'redux';
import {
  LOAD_LOGS_SUCCESS,
  LOAD_LOGS_START,
  LOAD_LOGS_ERROR,
} from '../constants';

const ids = (state = [], action) => {
  switch (action.type) {
    case LOAD_LOGS_SUCCESS: {
      return action.payload.result ? [...action.payload.result] : state; // [...new Set([...state, ...action.payload.result])];
    }

    default:
      return state;
  }
};
const isFetching = (state = false, action) => {
  switch (action.type) {
    case LOAD_LOGS_START:
      return true;
    case LOAD_LOGS_SUCCESS:
    case LOAD_LOGS_ERROR:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case LOAD_LOGS_ERROR:
      return action.message;
    case LOAD_LOGS_START:
    case LOAD_LOGS_SUCCESS:
      return null;

    default:
      return state;
  }
};

const logList = combineReducers({
  ids,
  isFetching,
  errorMessage,
});

export default logList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
