import merge from 'lodash.merge';
import {
  LOAD_REPLIES_SUCCESS,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
} from '../constants';

const addToParents = (state, action) => {
  if (action.payload.result.length) {
    // ! Assumes only replies are loaded, and every reply is loaded!
    const parentId =
      action.payload.entities.comments[
        Object.keys(action.payload.entities.comments)[0]
      ].parentId;
    return {
      ...state,
      ...action.payload.entities.comments,
      [parentId]: { ...state[parentId], replies: action.payload.result },
    };
  }
  return state;
};
export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_REPLIES_SUCCESS: {
      return addToParents(state, action);
    }
    case LOAD_DISCUSSIONS_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
      return merge({}, state, action.payload.entities.comments);

    default:
      return state;
  }
}

export const getComment = (state, id) => state[id] || {};
