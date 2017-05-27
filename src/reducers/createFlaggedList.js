import { combineReducers } from 'redux';
import {
  LOAD_FLAGGEDSTMTS_START,
  LOAD_FLAGGEDSTMTS_ERROR,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  UPDATE_FLAGGEDSTMT_SUCCESS,
} from '../constants';

const createList = (filter) => {
  const handleStateChange = (state, action) => {
    const { result: flagId, entities } = action.payload;
    const newState = entities.flaggedStatements[entities.flaggedStatements[flagId].state];
    return newState === filter
      ? [...new Set([...state, flagId])]
      : state.filter(id => id !== flagId);
  };
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_FLAGGEDSTMTS_SUCCESS: {
        return filter === action.filter || filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }
      case UPDATE_FLAGGEDSTMT_SUCCESS: {
        return filter !== 'all' ? handleStateChange(state, action) : state;
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
      case LOAD_FLAGGEDSTMTS_START:
        return true;
      case LOAD_FLAGGEDSTMTS_SUCCESS:
      case LOAD_FLAGGEDSTMTS_ERROR:
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
      case LOAD_FLAGGEDSTMTS_ERROR:
        return action.message;
      case LOAD_FLAGGEDSTMTS_START:
      case LOAD_FLAGGEDSTMTS_SUCCESS:
        return null;

      default:
        return state;
    }
  };
  const pageInfo = (state = { endCursor: '' }, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_FLAGGEDSTMTS_SUCCESS:
        return { ...state, ...action.pagination };

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
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
export const getPageInfo = state => state.pageInfo;
