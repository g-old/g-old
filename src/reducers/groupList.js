import { combineReducers } from 'redux';
import {
  LOAD_GROUPS_START,
  LOAD_GROUPS_SUCCESS,
  LOAD_GROUPS_ERROR,
  CREATE_GROUP_SUCCESS,
} from '../constants';

const ids = (state = [], action) => {
  switch (action.type) {
    case LOAD_GROUPS_SUCCESS: {
      return [...action.payload.result];
    }
    case CREATE_GROUP_SUCCESS: {
      return [...state, action.payload.result];
    }
    default:
      return state;
  }
};
const isFetching = (state = false, action) => {
  switch (action.type) {
    case LOAD_GROUPS_START:
      return true;
    case LOAD_GROUPS_SUCCESS:
    case LOAD_GROUPS_ERROR:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case LOAD_GROUPS_ERROR:
      return action.message;
    case LOAD_GROUPS_START:
    case LOAD_GROUPS_SUCCESS:
      return null;

    default:
      return state;
  }
};

const groupsList = combineReducers({
  ids,
  isFetching,
  errorMessage,
});

export default groupsList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
