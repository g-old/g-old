import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';

import byId, * as fromById from './groupById';
import allIds, * as fromList from './groupList';
import {
  groupList as groupListSchema,
  group as groupSchema,
} from './../store/schema';

export default combineReducers({
  byId,
  allIds,
});

const hydrateGroups = (state, data, entities) =>
  denormalize(
    { groups: data },
    { groups: groupListSchema },
    {
      ...entities,
      groups: entities.groups.byId,
      users: entities.users.byId,
      requests: entities.requests.byId,
    },
  );

export const getGroups = (state, entities) => {
  const ids = fromList.getIds(state.allIds);
  const hydrated = hydrateGroups(state, ids, entities);
  return hydrated.groups || [];
};

export const getGroup = (state, id, entities) =>
  denormalize(fromById.getGroup(state.byId, id), groupSchema, {
    ...entities,
    users: entities.users.byId,
    requests: entities.requests.byId,
    proposals: entities.proposals.byId,
    proposalStatus: entities.proposalStatus,
  });

export const getIsFetching = state => fromList.getIsFetching(state.allIds);
export const getErrorMessage = state => fromList.getErrorMessage(state.allIds);
