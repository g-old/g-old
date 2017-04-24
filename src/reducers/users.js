import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './userById';
import createList, * as fromList from './createUserList';
import { user as userSchema, userList as userArray } from './../store/schema';

const listByFilter = combineReducers({
  all: createList('all'),
  user: createList('user'),
  viewer: createList('viewer'),
  guest: createList('guest'),
});
export default combineReducers({
  byId,
  listByFilter,
});

const hydrateUser = (data, entities) => denormalize(data, userSchema, entities);
export const getUser = (state, id, entities) => {
  const user = fromById.getUser(state.byId, id);
  return hydrateUser(user, entities);
};

const hydrateUsers = (state, data, entities) =>
  denormalize(data, userArray, { ...entities, users: state.byId });

export const getVisibleUsers = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getUser(state.byId, id));
  return hydrateUsers(state, data, entities);
};

export const getIsFetching = (state, filter) => fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);
