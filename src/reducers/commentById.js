import merge from 'lodash.merge';
import { LOAD_COMMENTS_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_COMMENTS_SUCCESS:
      return merge({}, state, action.payload.entities.comments);

    default:
      return state;
  }
}

export const getComments = (state, id) => state[id] || {};
