import {
  CREATE_REQUEST_START,
  CREATE_REQUEST_SUCCESS,
  CREATE_REQUEST_ERROR,
  UPDATE_REQUEST_START,
  UPDATE_REQUEST_ERROR,
  UPDATE_REQUEST_SUCCESS,
  DELETE_REQUEST_START,
  DELETE_REQUEST_ERROR,
  DELETE_REQUEST_SUCCESS,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const requests = (state = {}, action) => {
  switch (action.type) {
    case CREATE_REQUEST_START:
    case UPDATE_REQUEST_START:
    case DELETE_REQUEST_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case CREATE_REQUEST_ERROR:
    case UPDATE_REQUEST_ERROR:
    case DELETE_REQUEST_ERROR: {
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
    case CREATE_REQUEST_SUCCESS:
    case UPDATE_REQUEST_SUCCESS:
    case DELETE_REQUEST_SUCCESS: {
      const id = action.id; // Is initial id!
      const current = state[id];
      const newState = getSuccessState(current, action);
      return {
        ...state,
        [id]: {
          ...state[id],
          ...newState,
        },
      };
    }

    default:
      return state;
  }
};
export default requests;

export const getStatus = (state, id) => state[id] || {};
