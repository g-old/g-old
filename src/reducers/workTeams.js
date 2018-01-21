import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';

import byId, * as fromById from './workTeamById';
import allIds, * as fromList from './workTeamList';
import {
  workTeamList as workTeamListSchema,
  workTeam as workTeamSchema,
} from './../store/schema';

export default combineReducers({
  byId,
  allIds,
});

const hydrateWorkTeams = (state, data, entities) =>
  denormalize(data, workTeamListSchema, {
    ...entities,
    users: entities.users.byId,
    requests: entities.requests.byId,
  });

export const getWorkTeams = (state, entities) => {
  const ids = fromList.getIds(state.allIds);
  const data = ids.map(id => fromById.getWorkTeam(state.byId, id));
  return hydrateWorkTeams(state, data, entities);
};

export const getWorkTeam = (state, id, entities) =>
  denormalize(fromById.getWorkTeam(state.byId, id), workTeamSchema, {
    ...entities,
    users: entities.users.byId,
    requests: entities.requests.byId,
    proposals: entities.proposals.byId,
  });

export const getIsFetching = state => fromList.getIsFetching(state.allIds);
export const getErrorMessage = state => fromList.getErrorMessage(state.allIds);
