import merge from 'lodash.merge';
import { LOAD_FEED_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.activities);
    }
    default:
      return state;
  }
}

export const getActivity = (state, id) => state[id];
