import {
  LOAD_PLATTFORM_SUCCESS,
  CREATE_PLATTFORM_SUCCESS,
  UPDATE_PLATTFORM_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_PLATTFORM_SUCCESS:
    case UPDATE_PLATTFORM_SUCCESS:
    case CREATE_PLATTFORM_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.plattforms,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
