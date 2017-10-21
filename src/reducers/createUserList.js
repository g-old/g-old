import { combineReducers } from 'redux';
import {
  LOAD_USERS_SUCCESS,
  LOAD_USERS_ERROR,
  LOAD_USERS_START,
  FIND_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  DELETE_USER_SUCCESS,
} from '../constants';

// TODO handle DELETE_USER
const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return { ...state, ...action.pagination };
};

const createList = filter => {
  const handleGroupChange = (state, action) => {
    const { groups, id } = action.payload.entities.users[action.payload.result];
    return groups === filter
      ? [...new Set([...state, id])]
      : state.filter(uId => uId !== id);
  };
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_USERS_SUCCESS: {
        return filter === action.filter || filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }
      case FIND_USER_SUCCESS: {
        return filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }
      case UPDATE_USER_SUCCESS: {
        return action.properties.groups && filter !== 'all'
          ? handleGroupChange(state, action)
          : state;
      }
      case DELETE_USER_SUCCESS: {
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
      case LOAD_USERS_START:
        return true;
      case LOAD_USERS_SUCCESS:
      case LOAD_USERS_ERROR:
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
      case LOAD_USERS_ERROR:
        return action.message;
      case LOAD_USERS_START:
      case LOAD_USERS_SUCCESS:
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
      case LOAD_USERS_SUCCESS:
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
  pageInfo: state.pageInfo,
  pending: state.isFetching,
  error: state.errorMessage,
});
