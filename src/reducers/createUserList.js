import { combineReducers } from 'redux';
import { LOAD_USERS_SUCCESS, LOAD_USERS_ERROR, LOAD_USERS_START } from '../constants';

// TODO handle DELETE_USER

const createList = filter => {
  const ids = (state = [], action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_USERS_SUCCESS: {
        const newEntries = action.payload.result;
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
