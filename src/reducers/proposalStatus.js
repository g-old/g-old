import { LOAD_GROUP_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_GROUP_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.proposalStatus,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
