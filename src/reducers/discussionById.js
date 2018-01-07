import merge from 'lodash.merge';
import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SSE_UPDATE_SUCCESS,
  CREATE_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  JOIN_WORKTEAM_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS:
    case JOIN_WORKTEAM_SUCCESS:
    case SSE_UPDATE_SUCCESS:
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.discussions);
    }
    case CREATE_COMMENT_SUCCESS: {
      const comment = action.payload.entities.comments[action.payload.result];
      return comment.parentId
        ? {
            ...state,
            [comment.discussionId]: {
              ...state[comment.discussionId],
              numComments: state[comment.discussionId].numComments + 1,
            },
          }
        : {
            ...state,
            [comment.discussionId]: {
              ...state[comment.discussionId],
              numComments: state[comment.discussionId].numComments + 1,
              comments: [
                comment.id,
                ...(state[comment.discussionId].comments &&
                  state[comment.discussionId].comments),
              ],
            },
          };
    }
    case DELETE_COMMENT_SUCCESS: {
      const comment = action.payload.entities.comments[action.payload.result];
      if (!comment.parentId) {
        return {
          ...state,
          [comment.discussionId]: {
            ...state[comment.discussionId],
            numComments:
              state[comment.discussionId].numComments -
              (comment.numReplies + 1),
            comments: state[comment.discussionId].comments.filter(
              c => c !== comment.id,
            ),
          },
        };
      }
      return state;
    }
    default:
      return state;
  }
}

export const getDiscussion = (state, id) => state[id] || {};
