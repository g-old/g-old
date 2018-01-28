import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';

import byId, * as fromById from './proposalById';
import createList, * as fromList from './createProposalsList';
import byTag, * as fromByTag from './proposalsByTag';

import { proposalList as proposalListSchema } from './../store/schema';

const listByFilter = combineReducers({
  all: createList('all'),
  active: createList('active'),
  accepted: createList('accepted'),
  repelled: createList('repelled'),
  survey: createList('survey'),
  pending: createList('pending'),
});

export default combineReducers({
  byId,
  listByFilter,
  byTag,
});

const hydrateProposals = (state, data, entities) =>
  denormalize(data, proposalListSchema, {
    ...entities,
    proposals: state.byId,
    users: entities.users.byId,
    statements: entities.statements.byId,
  });

export const getVisibleProposals = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getProposal(state.byId, id));
  return hydrateProposals(state, data, entities);
};

export const getIsFetching = (state, filter) =>
  fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);

export const getProposal = (state, id, entities) => {
  const proposal = fromById.getProposal(state.byId, id);
  return hydrateProposals(state, [proposal], entities)[0];
};

export const getProposalsByTag = (state, tagId, entities) =>
  hydrateProposals(
    state,
    fromByTag
      .getIds(state.byTag, tagId)
      .map(id => fromById.getProposal(state.byId, id)),
    entities,
  );

export const getPageInfo = (state, filter) => ({
  ...fromList.getPageInfo(state.listByFilter[filter]),
  //  isFetching: fromList.getIsFetching(state.listByFilter[filter]),
  //  errorMessage: fromList.getErrorMessage(state.listByFilter[filter]),
});
