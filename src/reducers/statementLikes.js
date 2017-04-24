import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
} from '../constants';

export default function statementLikes(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.statementLikes);
    }
    case CREATE_LIKE_SUCCESS: {
      return merge({}, state, action.payload.entities.statementLikes);
    }
    case DELETE_LIKE_SUCCESS: {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload.result]: omit, ...other } = state;
      return other;
    }

    default:
      return state;
  }
}
