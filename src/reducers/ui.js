import { combineReducers } from 'redux';

import users, * as fromUser from './ui/users';
import { SESSION_LOGOUT_SUCCESS } from '../constants';
import loading from './ui/loading';

/* GENERATOR_IMPORTS */

const uiReducer = combineReducers({
  /* GENERATOR_COMBINE */

  users,
  loading,
});
export default (state, action) => {
  if (action.type === SESSION_LOGOUT_SUCCESS) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return uiReducer(state, action);
};

/* GENERATOR_EXPORTS */

export const getAccountUpdates = (state, id) =>
  fromUser.getStatus(state.users, id) || {};
