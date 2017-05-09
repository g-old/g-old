import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './activityById';
import allIds, * as fromList from './activityList';
import { activityArray as activityArraySchema } from './../store/schema';

export default combineReducers({
  byId,
  allIds,
});

const hydrateActivities = (state, data, entities) =>
  denormalize(data, activityArraySchema, {
    ...entities,
    users: entities.users.byId,
    proposals: entities.proposals.byId,
  });

export const getActivities = (state, entities) => {
  const ids = fromList.getIds(state.allIds);
  const data = ids.map(id => fromById.getActivity(state.byId, id));
  return hydrateActivities(state, data, entities);
};

export const getIsFetching = state => fromList.getIsFetching(state.allIds);
export const getErrorMessage = state => fromList.getErrorMessage(state.allIds);
