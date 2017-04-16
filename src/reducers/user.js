import {
  SESSION_LOGOUT_SUCCESS,
  CREATE_USER_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  RESET_PASSWORD_SUCCESS,
} from '../constants';

export default function user(state = {}, action) {
  switch (action.type) {
    case SESSION_LOGOUT_SUCCESS: {
      return {};
    }
    case CREATE_USER_SUCCESS: {
      // rename?
      return action.payload.user.id;
    }
    case UPLOAD_AVATAR_SUCCESS: {
      /* return {
        ...state,
        avatar: action.payload.avatar,
      }; */
      return state;
    }
    case RESET_PASSWORD_SUCCESS: {
      // return action.payload.user || {};
      return state;
    }
    default:
      return state;
  }
}
