import merge from 'lodash.merge';
import {
  LOAD_REPLIES_SUCCESS,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  CREATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  LOAD_FEED_SUCCESS,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_ACTIVITIES_SUCCESS,
} from '../constants';

const addToParents = (state, action) => {
  // ! Assumes only replies are loaded, and every reply is loaded!
  const cIds = Object.keys(action.payload.entities.comments);
  const { parentId } = action.payload.entities.comments[cIds[0]];
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
    case LOAD_ACTIVITIES_SUCCESS:
    case LOAD_FEED_SUCCESS:
      return merge({}, state, action.payload.entities.comments);
    case LOAD_NOTIFICATIONS_SUCCESS: {
      const replies = Object.keys(
        action.payload.entities.comments || [],
      ).reduce((acc, commentId) => {
        const comment = action.payload.entities.comments[commentId];

        if (comment.parentId) {
          if (acc[comment.parentId]) {
            acc[comment.parentId].push(comment.id);
          } else {
            acc[comment.parentId] = [comment.id];
          }
        }
        return acc;
      }, {});

      const tempState = Object.keys(replies).reduce((acc, parentId) => {
        const parent =
          state[parentId] || action.payload.entities.comments[parentId] || {};
        if (parent) {
          acc[parent.id] = {
            ...parent,
            replies: [
              ...new Set([
                ...replies[parentId],
                ...(parent.replies ? parent.replies : []),
              ]),
            ],
          };
        }
        return acc;
      }, {});
      return {
        ...state,
        ...(action.payload.entities.comments
          ? action.payload.entities.comments
          : []),
        ...tempState,
      };
    }

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
