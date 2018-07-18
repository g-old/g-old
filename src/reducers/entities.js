import { combineReducers } from 'redux';
import users, * as fromUsers from './users';

/* GENERATOR */

export default combineReducers({
  /* GENERATOR_COMBINED */

  users,
});

export const getUser = (state, id) => fromUsers.getUser(state, id);

/* GENERATOR_EXPORTS */
