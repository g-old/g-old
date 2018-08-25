import { combineReducers } from 'redux';
import {
  LOAD_FEED_SUCCESS,
  LOAD_FEED_START,
  LOAD_FEED_ERROR,
  LOAD_ACTIVITIES_START,
  LOAD_ACTIVITIES_SUCCESS,
  LOAD_ACTIVITIES_ERROR,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const createList = filter => {
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_ACTIVITIES_SUCCESS:
      case LOAD_FEED_SUCCESS: {
        return filter === action.filter
          ? [
              ...new Set([
                ...action.payload.result,
                ...(action.purge ? [] : state),
              ]),
            ]
          : state;
      }
      case SSE_UPDATE_SUCCESS: {
        return filter === action.filter
          ? [action.payload.result, ...state]
          : state;
      }
      default:
        return state;
    }
  };
  const isFetching = (state = false, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_ACTIVITIES_START:
      case LOAD_FEED_START:
        return true;
      case LOAD_ACTIVITIES_SUCCESS:
      case LOAD_ACTIVITIES_ERROR:
      case LOAD_FEED_SUCCESS:
      case LOAD_FEED_ERROR:
        return false;
      default:
        return state;
    }
  };

  const errorMessage = (state = null, action) => {
    if (action.filter !== filter) {
      return state;
    }

    switch (action.type) {
      case LOAD_ACTIVITIES_ERROR:
      case LOAD_FEED_ERROR:
        return action.message;
      case LOAD_ACTIVITIES_START:
      case LOAD_ACTIVITIES_SUCCESS:
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
