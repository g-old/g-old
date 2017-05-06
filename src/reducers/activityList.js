import { combineReducers } from 'redux';
import { LOAD_FEED_SUCCESS, LOAD_FEED_START, LOAD_FEED_ERROR } from '../constants';

const ids = (state = [], action) => {
  switch (action.type) {
    case LOAD_FEED_SUCCESS: {
      return [...action.payload.result]; // [...new Set([...state, ...action.payload.result])];
    }
    default:
      return state;
  }
};
const isFetching = (state = false, action) => {
  switch (action.type) {
    case LOAD_FEED_START:
      return true;
    case LOAD_FEED_SUCCESS:
    case LOAD_FEED_ERROR:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case LOAD_FEED_ERROR:
      return action.message;
    case LOAD_FEED_START:
    case LOAD_FEED_SUCCESS:
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
