import {
  LOAD_ASSETS_SUCCESS,
  CREATE_ASSET_SUCCESS,
  UPDATE_ASSET_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_ASSETS_SUCCESS:
    case UPDATE_ASSET_SUCCESS:
    case CREATE_ASSET_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.assets,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
