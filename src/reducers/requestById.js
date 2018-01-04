import {
  LOAD_REQUESTS_SUCCESS,
  CREATE_REQUEST_SUCCESS,
  UPDATE_REQUEST_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_REQUESTS_SUCCESS:
    case UPDATE_REQUEST_SUCCESS:
    case CREATE_REQUEST_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.requests,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
