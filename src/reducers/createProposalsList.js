import { combineReducers } from 'redux';
import {
  LOAD_PROPOSAL_LIST_START,
  LOAD_PROPOSAL_LIST_ERROR,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
} from '../constants';

const createList = filter => {
  const ids = (state = [], action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_PROPOSAL_SUCCESS: {
        return [...new Set([...state, action.payload.result])];
      }
      case LOAD_PROPOSAL_LIST_SUCCESS: {
        const newEntries = action.payload.result || [];
        return [...new Set([...state, ...newEntries])];
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
      case LOAD_PROPOSAL_LIST_START:
        return true;
      case LOAD_PROPOSAL_LIST_SUCCESS:
      case LOAD_PROPOSAL_LIST_ERROR:
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
      case LOAD_PROPOSAL_LIST_ERROR:
        return action.message;
      case LOAD_PROPOSAL_LIST_START:
      case LOAD_PROPOSAL_LIST_SUCCESS:
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
