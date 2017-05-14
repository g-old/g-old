import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_TAGS_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
} from '../constants';

export default function tags(state = {}, action) {
  switch (action.type) {
    case LOAD_TAGS_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.tags);
    }
    default:
      return state;
  }
}
export const getTags = state => Object.keys(state).map(id => state[id]);
