import { SESSION_LOGOUT_SUCCESS, CREATE_USER_SUCCESS } from '../constants';

export default function user(state = {}, action) {
  switch (action.type) {
    case SESSION_LOGOUT_SUCCESS: {
      return {};
    }
    case CREATE_USER_SUCCESS: {
      // rename?
      return {
        ...action.payload.user,
      };
    }
    default:
      return state;
  }
}
