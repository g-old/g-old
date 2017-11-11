import merge from 'lodash.merge';
import {
  LOAD_REPLIES_SUCCESS,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  CREATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
} from '../constants';

const addToParents = (state, action) => {
  // ! Assumes only replies are loaded, and every reply is loaded!
  const cIds = Object.keys(action.payload.entities.comments);
  const parentId = action.payload.entities.comments[cIds[0]].parentId;
  if (parentId) {
    const replies = state[parentId].replies || [];

    return {
      ...state,
      ...action.payload.entities.comments,
      [parentId]: {
        ...state[parentId],
        ...(action.type === CREATE_COMMENT_SUCCESS && {
          numReplies: state[parentId].numReplies + 1,
        }),
        replies: [...new Set([...replies, ...cIds])],
      },
    };
  }
  return { ...state, ...action.payload.entities.comments };
};
export default function byId(state = {}, action) {
  switch (action.type) {
    case CREATE_COMMENT_SUCCESS:
    case LOAD_REPLIES_SUCCESS: {
      return action.payload.entities.comments
        ? addToParents(state, action)
        : state;
    }
    case LOAD_DISCUSSIONS_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
    case UPDATE_COMMENT_SUCCESS:
      return merge({}, state, action.payload.entities.comments);

    case DELETE_COMMENT_SUCCESS: {
      const comment = action.payload.entities.comments[action.payload.result];
      if (comment.parentId) {
        return {
          ...state,
          [comment.parentId]: {
            ...state[comment.parentId],
            numReplies: state[comment.parentId].numReplies - 1,
            replies: state[comment.parentId].replies.filter(
              r => r !== comment.id,
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

export const getComment = (state, id) => state[id] || {};
