import { LOAD_FEED_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_FEED_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.posts,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
