import merge from 'lodash.merge';
import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SSE_UPDATE_SUCCESS,
  CREATE_COMMENT_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS:
    case SSE_UPDATE_SUCCESS:
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.discussions);
    }
    case CREATE_COMMENT_SUCCESS: {
      const comment = action.payload.entities.comments[action.payload.result];
      return comment.parentId
        ? state
        : {
            ...state,
            [comment.discussionId]: {
              ...state[comment.discussionId],
              comments: [
                ...(state[comment.discussionId].comments &&
                  state[comment.discussionId].comments),
                comment.id,
              ],
            },
          };
    }
    default:
      return state;
  }
}

export const getDiscussion = (state, id) => state[id] || {};
