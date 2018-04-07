import { combineReducers } from 'redux';
import {
  LOAD_NOTIFICATIONS_START,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_NOTIFICATIONS_ERROR,
  CREATE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
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
      case CREATE_NOTIFICATION_SUCCESS:
      case LOAD_NOTIFICATIONS_SUCCESS: {
        return filter === action.filter || filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }

      case DELETE_NOTIFICATION_SUCCESS: {
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
      case LOAD_NOTIFICATIONS_START:
        return true;
      case LOAD_NOTIFICATIONS_SUCCESS:
      case LOAD_NOTIFICATIONS_ERROR:
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
      case LOAD_NOTIFICATIONS_ERROR:
        return action.message;
      case LOAD_NOTIFICATIONS_START:
      case LOAD_NOTIFICATIONS_SUCCESS:
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
      case LOAD_NOTIFICATIONS_SUCCESS:
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
