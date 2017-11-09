import { combineReducers } from 'redux';
import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_DISCUSSIONS_START,
  LOAD_DISCUSSIONS_ERROR,
  LOAD_DISCUSSION_START,
  LOAD_DISCUSSION_ERROR,
} from '../constants';

const ids = (state = [], action) => {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS: {
      return [...new Set([...state, ...action.payload.result])];
    }

    default:
      return state;
  }
};
const isFetching = (state = false, action) => {
  switch (action.type) {
    case LOAD_DISCUSSION_START:
    case LOAD_DISCUSSIONS_START:
      return true;
    case LOAD_DISCUSSIONS_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSION_ERROR:
    case LOAD_DISCUSSIONS_ERROR:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case LOAD_DISCUSSION_ERROR:
    case LOAD_DISCUSSIONS_ERROR:
      return action.message || null;
    case LOAD_DISCUSSION_START:
    case LOAD_DISCUSSIONS_START:
    case LOAD_DISCUSSIONS_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
      return null;

    default:
      return state;
  }
};

const activityList = combineReducers({
  ids,
  isFetching,
  errorMessage,
});

export default activityList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
