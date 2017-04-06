import { SESSION_LOGOUT_SUCCESS } from '../constants';

export default function user(state = {}, action) {
  switch (action.type) {
    case SESSION_LOGOUT_SUCCESS: {
      return {};
    }
    default:
      return state;
  }
}
