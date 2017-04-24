import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_VOTES_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  LOAD_USERS_SUCCESS,
  CREATE_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  RESET_PASSWORD_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS: {
      return merge({}, state, action.payload.users);
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      // change
      return merge({}, state, action.payload.users);
    }
    case LOAD_VOTES_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case CREATE_STATEMENT_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case LOAD_USERS_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case CREATE_USER_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case UPDATE_USER_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case UPLOAD_AVATAR_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    case RESET_PASSWORD_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }
    default:
      return state;
  }
}

export const getUser = (state, id) => state[id];
