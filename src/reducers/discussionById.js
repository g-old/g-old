import merge from 'lodash.merge';
import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS:
    case SSE_UPDATE_SUCCESS:
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.discussions);
    }
    default:
      return state;
  }
}

export const getDiscussion = (state, id) => state[id] || {};
