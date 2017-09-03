import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './logById';
// import allIds, * as fromList from './activityList';
import allIds, * as fromList from './logList';
import { logList as logsSchema } from './../store/schema';

export default combineReducers({
  byId,
  allIds,
});

const hydrateActivities = (state, data, entities) =>
  denormalize(data, logsSchema, {
    ...entities,
    users: entities.users.byId,
  });

export const getLogs = (state, entities) => {
  const ids = fromList.getIds(state.allIds);
  const data = ids.map(id => fromById.getLog(state.byId, id));
  return hydrateActivities(state, data, entities);
};

export const getIsFetching = state => fromList.getIsFetching(state.allIds);
export const getErrorMessage = state => fromList.getErrorMessage(state.allIds);
