import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './userById';
import createList, * as fromList from './createUserList';
import { user as userSchema, userList as userArray } from './../store/schema';
import { Groups } from '../organization';

/* eslint-disable no-bitwise */
const listByFilter = combineReducers({
  all: createList('all'),
  [Groups.VIEWER | Groups.VOTER]: createList(Groups.VIEWER | Groups.VOTER),
  [Groups.VIEWER | Groups.GUEST]: createList(Groups.VIEWER | Groups.GUEST),
  [Groups.GUEST]: createList(Groups.GUEST),
});
/* eslint-enable no-bitwise */

export default combineReducers({
  byId,
  listByFilter,
});

const hydrateUser = (data, entities) => denormalize(data, userSchema, entities);
const hydrateUsers = (state, data, entities) =>
  denormalize(
    { users: data },
    { users: userArray },
    { ...entities, users: state.byId },
  );

export const getUser = (state, id, entities) => {
  const user = fromById.getUser(state.byId, id);
  return hydrateUser(user, {
    ...entities,
    users: entities.users.byId,
    groups: entities.groups.byId,
    requests: entities.requests.byId,
  });
};

export const getVisibleUsers = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const hydrated = hydrateUsers(state, ids, entities);
  return hydrated.users || [];
};

export const getStatus = (state, filter) =>
  fromList.getStatus(state.listByFilter[filter]);
