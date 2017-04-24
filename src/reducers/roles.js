import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_USERS_SUCCESS,
  CREATE_USER_SUCCESS,
} from '../constants';

export default function roles(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.roles);
    }
    case LOAD_USERS_SUCCESS:
    case CREATE_USER_SUCCESS: {
      return merge({}, state, action.payload.entities.roles);
    }
    default:
      return state;
  }
}
