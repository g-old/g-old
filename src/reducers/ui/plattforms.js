import {
  CREATE_PLATTFORM_START,
  CREATE_PLATTFORM_SUCCESS,
  CREATE_PLATTFORM_ERROR,
  UPDATE_PLATTFORM_START,
  UPDATE_PLATTFORM_ERROR,
  UPDATE_PLATTFORM_SUCCESS,
  DELETE_PLATTFORM_START,
  DELETE_PLATTFORM_ERROR,
  DELETE_PLATTFORM_SUCCESS,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const plattforms = (state = {}, action) => {
  switch (action.type) {
    case CREATE_PLATTFORM_START:
    case UPDATE_PLATTFORM_START:
    case DELETE_PLATTFORM_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case CREATE_PLATTFORM_ERROR:
    case UPDATE_PLATTFORM_ERROR:
    case DELETE_PLATTFORM_ERROR: {
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
    case CREATE_PLATTFORM_SUCCESS:
    case UPDATE_PLATTFORM_SUCCESS:
    case DELETE_PLATTFORM_SUCCESS: {
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
export default plattforms;

export const getStatus = (state, id) => state[id] || {};
