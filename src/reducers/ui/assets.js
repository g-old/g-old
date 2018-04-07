import {
  CREATE_ASSET_START,
  CREATE_ASSET_SUCCESS,
  CREATE_ASSET_ERROR,
  UPDATE_ASSET_START,
  UPDATE_ASSET_ERROR,
  UPDATE_ASSET_SUCCESS,
  DELETE_ASSET_START,
  DELETE_ASSET_ERROR,
  DELETE_ASSET_SUCCESS,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const assets = (state = {}, action) => {
  switch (action.type) {
    case CREATE_ASSET_START:
    case UPDATE_ASSET_START:
    case DELETE_ASSET_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case CREATE_ASSET_ERROR:
    case UPDATE_ASSET_ERROR:
    case DELETE_ASSET_ERROR: {
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
    case CREATE_ASSET_SUCCESS:
    case UPDATE_ASSET_SUCCESS:
    case DELETE_ASSET_SUCCESS: {
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
export default assets;

export const getStatus = (state, id) => state[id] || {};
