import {
  CREATE_PLATFORM_START,
  CREATE_PLATFORM_SUCCESS,
  CREATE_PLATFORM_ERROR,
  UPDATE_PLATFORM_START,
  UPDATE_PLATFORM_ERROR,
  UPDATE_PLATFORM_SUCCESS,
  DELETE_PLATFORM_START,
  DELETE_PLATFORM_ERROR,
  DELETE_PLATFORM_SUCCESS,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const platforms = (state = {}, action) => {
  switch (action.type) {
    case CREATE_PLATFORM_START:
    case UPDATE_PLATFORM_START:
    case DELETE_PLATFORM_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case CREATE_PLATFORM_ERROR:
    case UPDATE_PLATFORM_ERROR:
    case DELETE_PLATFORM_ERROR: {
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
    case CREATE_PLATFORM_SUCCESS:
    case UPDATE_PLATFORM_SUCCESS:
    case DELETE_PLATFORM_SUCCESS: {
      const { id } = action; // Is initial id!
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
export default platforms;

export const getStatus = (state, id) => state[id] || {};
