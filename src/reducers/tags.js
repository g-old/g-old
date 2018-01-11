import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_TAGS_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
  CREATE_TAG_SUCCESS,
  UPDATE_TAG_SUCCESS,
  DELETE_TAG_SUCCESS,
} from '../constants';

export default function tags(state = {}, action) {
  switch (action.type) {
    case LOAD_TAGS_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case UPDATE_PROPOSAL_SUCCESS:
    case UPDATE_TAG_SUCCESS:
    case CREATE_TAG_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.tags);
    }

    case DELETE_TAG_SUCCESS: {
      const { [action.payload.result]: toDelete, ...rest } = state;
      return rest;
    }

    default:
      return state;
  }
}
export const getTags = state => Object.keys(state).map(id => state[id]);
export const getTag = (state, id) => state[id];
