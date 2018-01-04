import { combineReducers } from 'redux';
import {
  LOAD_REQUESTS_START,
  LOAD_REQUESTS_SUCCESS,
  LOAD_REQUESTS_ERROR,
  CREATE_REQUEST_SUCCESS,
  DELETE_REQUEST_SUCCESS,
} from '../constants';

const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return { ...state, ...action.pagination };
};

const createList = filter => {
  const ids = (state = [], action) => {
    switch (action.type) {
      case CREATE_REQUEST_SUCCESS:
      case LOAD_REQUESTS_SUCCESS: {
        return filter === action.filter || filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }
      case DELETE_REQUEST_SUCCESS: {
        return state.filter(uId => uId !== action.payload.result);
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
      case LOAD_REQUESTS_START:
        return true;
      case LOAD_REQUESTS_SUCCESS:
      case LOAD_REQUESTS_ERROR:
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
      case LOAD_REQUESTS_ERROR:
        return action.message;
      case LOAD_REQUESTS_START:
      case LOAD_REQUESTS_SUCCESS:
        return null;

      default:
        return state;
    }
  };
  const pageInfo = (state = { endCursor: '', hasNextPage: false }, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_REQUESTS_SUCCESS:
        return handlePageInfo(state, action);

      default:
        return state;
    }
  };
  return combineReducers({
    ids,
    isFetching,
    errorMessage,
    pageInfo,
  });
};

export default createList;
export const getIds = state => state.ids;
export const getStatus = state => ({
  ...state.pageInfo,
  pending: state.isFetching,
  error: state.errorMessage,
});
