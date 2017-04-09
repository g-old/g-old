import { SESSION_LOGOUT_SUCCESS, CREATE_USER_SUCCESS, UPLOAD_AVATAR_SUCCESS } from '../constants';

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
    case UPLOAD_AVATAR_SUCCESS: {
      return {
        ...state,
        avatar: action.payload.avatar,
      };
    }
    default:
      return state;
  }
}
