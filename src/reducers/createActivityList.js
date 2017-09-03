import { combineReducers } from 'redux';
import {
  LOAD_FEED_SUCCESS,
  LOAD_FEED_START,
  LOAD_FEED_ERROR,
  SSE_UPDATE_SUCCESS,
} from '../constants';

// TODO handle DELETE_USER

const createList = filter => {
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_FEED_SUCCESS: {
        if (filter) {
          return action.log
            ? [...new Set([...action.payload.result, ...state])]
            : state;
        }
        return action.log
          ? state
          : [...new Set([...action.payload.result, ...state])];
      }
      case SSE_UPDATE_SUCCESS: {
        return filter ? state : [action.payload.result, ...state];
      }
      default:
        return state;
    }
  };
  const isFetching = (state = false, action) => {
    if (filter) {
      if (!action.log) return state;
    } else if (action.log) return state;
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
    if (filter) {
      if (!action.log) return state;
    } else if (action.log) return state;

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
  return combineReducers({
    ids,
    isFetching,
    errorMessage,
  });
};

export default createList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
