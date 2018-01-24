import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './activityById';
// import allIds, * as fromList from './activityList';
import createList, * as fromList from './createActivityList';
import { activityArray as activityArraySchema } from './../store/schema';

const listByFilter = combineReducers({
  all: createList(),
  log: createList(true),
});

export default combineReducers({
  byId,
  listByFilter,
});

const hydrateActivities = (state, data, entities) =>
  denormalize(data, activityArraySchema, {
    ...entities,
    users: entities.users.byId,
    proposals: entities.proposals.byId,
    statements: entities.statements.byId,
    comments: entities.comments.byId,
  });

export const getActivities = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getActivity(state.byId, id));
  return hydrateActivities(state, data, entities);
};

export const getIsFetching = (state, filter) =>
  fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);
