import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId from './activityById';
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
  denormalize(
    { activities: data },
    { activities: activityArraySchema },
    {
      ...entities,
      activities: entities.activities.byId,
      users: entities.users.byId,
      proposals: entities.proposals.byId,
      statements: entities.statements.byId,
      comments: entities.comments.byId,
      discussions: entities.discussions.byId,
    },
  );

export const getActivities = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const hydrated = hydrateActivities(state, ids, entities);
  return hydrated.activities || [];
};

export const getIsFetching = (state, filter) =>
  fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);
