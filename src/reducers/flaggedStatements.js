import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import { flaggedStatementArray } from './../store/schema';
import createFlaggedList, * as fromList from './createFlaggedList';
import byId, * as fromById from './flaggedStatementsById';

const listByFilter = combineReducers({
  all: createFlaggedList('all'),
  open: createFlaggedList('open'),
  deleted: createFlaggedList('deleted'),
  rejected: createFlaggedList('rejected'),
});

const flaggedStatements = combineReducers({
  byId,
  listByFilter,
});

export default flaggedStatements;

const hydrateFlags = (data, entities) =>
  denormalize(data, flaggedStatementArray, {
    ...entities,
    users: entities.users.byId,
    statements: entities.statements.byId,
    flaggedStatements: entities.flaggedStatements.byId,
  });

export const getVisibleFlags = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getFlaggedStatement(state.byId, id));
  return hydrateFlags(data, entities);
};
export const getPageInfo = (state, filter) => ({
  pageInfo: fromList.getPageInfo(state.listByFilter[filter]),
  isFetching: fromList.getIsFetching(state.listByFilter[filter]),
  errorMessage: fromList.getErrorMessage(state.listByFilter[filter]),
});
export const getIsFetching = (state, filter) => fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);
// hydrateStatements(fromList.getIds(state.listByFilter[filter]).map(s => state.byId[s]), entities);
