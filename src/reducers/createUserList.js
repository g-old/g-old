import { combineReducers } from 'redux';
import {
  LOAD_USERS_SUCCESS,
  LOAD_USERS_ERROR,
  LOAD_USERS_START,
  FIND_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
} from '../constants';

// TODO handle DELETE_USER

const createList = (filter) => {
  const handleRoleChange = (state, action) => {
    const { result: userId, entities } = action.payload;
    const { type } = entities.roles[entities.users[userId].role];
    return type === filter ? [...new Set([...state, userId])] : state.filter(id => id !== userId);
  };
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_USERS_SUCCESS: {
        return filter === action.filter || filter === 'all'
          ? [...new Set([...state, ...action.payload.result])]
          : state;
      }
      case FIND_USER_SUCCESS: {
        return filter === 'all' ? [...new Set([...state, ...action.payload.result])] : state;
      }
      case UPDATE_USER_SUCCESS: {
        return action.properties.role && filter !== 'all' ? handleRoleChange(state, action) : state;
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
