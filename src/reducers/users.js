import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './userById';
import createList, * as fromList from './createUserList';
import { user as userSchema, userList as userArray } from './../store/schema';
import { Groups } from '../organization';

/* eslint-disable no-bitwise */
const listByFilter = combineReducers({
  all: createList('all'),
  user: createList('user'),
  [Groups.VIEWER | Groups.USER]: createList(Groups.VIEWER | Groups.USER),
  [Groups.USER]: createList(Groups.USER),
});
/* eslint-enable no-bitwise */

export default combineReducers({
  byId,
  listByFilter,
});

const hydrateUser = (data, entities) => denormalize(data, userSchema, entities);
const hydrateUsers = (state, data, entities) =>
  denormalize(data, userArray, { ...entities, users: state.byId });

export const getUser = (state, id, entities) => {
  const user = fromById.getUser(state.byId, id);
  return hydrateUser(user, {
    ...entities,
    users: entities.users.byId,
    workTeams: entities.workTeams.byId,
  });
};

export const getVisibleUsers = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getUser(state.byId, id));
  return hydrateUsers(state, data, entities);
};

export const getStatus = (state, filter) =>
  fromList.getStatus(state.listByFilter[filter]);
