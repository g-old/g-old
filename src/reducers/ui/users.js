import {
  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
  UPDATE_USER_START,
  UPDATE_USER_ERROR,
  UPDATE_USER_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_ERROR,
  UPLOAD_AVATAR_START,
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  SESSION_LOGIN_START,
  SESSION_LOGIN_SUCCESS,
  SESSION_LOGIN_ERROR,
  CREATE_VEMAIL_START,
  CREATE_VEMAIL_SUCCESS,
  CREATE_VEMAIL_ERROR,
  CREATE_MESSAGE_START,
  CREATE_MESSAGE_SUCCESS,
  CREATE_MESSAGE_ERROR,
  DELETE_USER_SUCCESS,
  DELETE_USER_ERROR,
  DELETE_USER_START,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const users = (state = {}, action) => {
  switch (action.type) {
    case CREATE_USER_START:
    case SESSION_LOGIN_START:
    case UPLOAD_AVATAR_START:
    case RESET_PASSWORD_START:
    case UPDATE_USER_START:
    case CREATE_MESSAGE_START:
    case DELETE_USER_START:
    case CREATE_VEMAIL_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case RESET_PASSWORD_ERROR:
    case CREATE_USER_ERROR:
    case SESSION_LOGIN_ERROR:
    case UPLOAD_AVATAR_ERROR:
    case UPDATE_USER_ERROR:
    case CREATE_MESSAGE_ERROR:
    case DELETE_USER_ERROR:
    case CREATE_VEMAIL_ERROR: {
      const current = state[action.id];
      const newState = getErrors(current, action);
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...newState,
        },
      };
    }
    case RESET_PASSWORD_SUCCESS:
    case UPDATE_USER_SUCCESS:
    case CREATE_USER_SUCCESS:
    case SESSION_LOGIN_SUCCESS:
    case UPLOAD_AVATAR_SUCCESS:
    case CREATE_MESSAGE_SUCCESS:
    case DELETE_USER_SUCCESS:
    case CREATE_VEMAIL_SUCCESS: {
      const { id } = action; // Is initial id!
      const current = state[id];
      if (current) {
        const newState = getSuccessState(current, action);
        return {
          ...state,
          [id]: {
            ...state[id],
            ...newState,
          },
        };
      }
      return state;
    }

    default:
      return state;
  }
};
export default users;

export const getStatus = (state, id) => state[id] || {};
