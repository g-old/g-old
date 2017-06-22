import {
  LOAD_VOTES_SUCCESS,
  LOAD_VOTES_START,
  LOAD_VOTES_ERROR,
  CREATE_VOTE_START,
  CREATE_VOTE_ERROR,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_START,
  UPDATE_VOTE_SUCCESS,
  UPDATE_VOTE_ERROR,
  DELETE_VOTE_START,
  DELETE_VOTE_SUCCESS,
  DELETE_VOTE_ERROR,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const polls = (state = {}, action) => {
  switch (action.type) {
    case LOAD_VOTES_SUCCESS:
    case UPDATE_VOTE_SUCCESS:
    case DELETE_VOTE_SUCCESS:
    case CREATE_VOTE_SUCCESS: {
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
    case LOAD_VOTES_START:
    case UPDATE_VOTE_START:
    case DELETE_VOTE_START:
    case CREATE_VOTE_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }
    case LOAD_VOTES_ERROR:
    case UPDATE_VOTE_ERROR:
    case DELETE_VOTE_ERROR:
    case CREATE_VOTE_ERROR: {
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

export default polls;
export const getPoll = (state, id) => state[id] || {};
export const getUpdates = (state, id) => state[id] || {};
