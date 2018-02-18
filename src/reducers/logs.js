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
  denormalize(
    { logs: data },
    { logs: logsSchema },
    {
      ...entities,
      logs: entities.logs.byId,
      users: entities.users.byId,
    },
  );

export const getLogs = (state, entities) => {
  const ids = fromList.getIds(state.allIds);
  console.log({ ids: ids });
  const hydrated = hydrateActivities(state, ids, entities);
  console.log('hydrated', hydrated);
  return hydrated.logs || [];
};

export const getIsFetching = state => fromList.getIsFetching(state.allIds);
export const getErrorMessage = state => fromList.getErrorMessage(state.allIds);
