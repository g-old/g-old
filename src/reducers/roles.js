import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_USERS_SUCCESS,
  CREATE_USER_SUCCESS,
  FIND_USER_SUCCESS,
  FETCH_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SESSION_LOGIN_SUCCESS,
} from '../constants';

export default function roles(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.roles);
    }
    case LOAD_FEED_SUCCESS:
    case SESSION_LOGIN_SUCCESS:
    case UPDATE_USER_SUCCESS:
    case FETCH_USER_SUCCESS:
    case FIND_USER_SUCCESS:
    case LOAD_USERS_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS:
    case CREATE_USER_SUCCESS: {
      return merge({}, state, action.payload.entities.roles);
    }
    default:
      return state;
  }
}
