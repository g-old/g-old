import {
  CREATE_STATEMENT_START,
  CREATE_STATEMENT_SUCCESS,
  CREATE_STATEMENT_ERROR,
  UPDATE_STATEMENT_START,
  UPDATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_ERROR,
  DELETE_STATEMENT_START,
  DELETE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_ERROR,
} from '../../constants';
import { getErrors, getSuccessState } from '../../core/helpers';

const statements = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_STATEMENT_START:
    case DELETE_STATEMENT_START:
    case CREATE_STATEMENT_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }
    case CREATE_STATEMENT_SUCCESS:
    case UPDATE_STATEMENT_SUCCESS:
    case DELETE_STATEMENT_SUCCESS: {
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

    case UPDATE_STATEMENT_ERROR:
    case DELETE_STATEMENT_ERROR:
    case CREATE_STATEMENT_ERROR: {
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

    default:
      return state;
  }
};

export const getUpdates = state => state;
export default statements;
