import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';

import byId, * as fromById from './proposalById';
import createList, * as fromList from './createProposalsList';
import byTag, * as fromByTag from './proposalsByTag';
import byWT, * as fromByWT from './proposalsByWorkTeam';
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
  byWT,
});

const hydrateProposals = (state, data, entities) =>
  denormalize(
    { proposals: data },
    { proposals: proposalListSchema },
    {
      ...entities,
      proposals: state.byId,
      users: entities.users.byId,
      statements: entities.statements.byId,
      subscriptions: entities.subscriptions.byId,
    },
  );

export const getVisibleProposals = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const hydrated = hydrateProposals(state, ids, entities);
  return hydrated.proposals || [];
};

export const getIsFetching = (state, filter) =>
  fromList.getIsFetching(state.listByFilter[filter]);
export const getErrorMessage = (state, filter) =>
  fromList.getErrorMessage(state.listByFilter[filter]);

export const getProposal = (state, id, entities) => {
  const proposal = fromById.getProposal(state.byId, id);
  const hydrated = hydrateProposals(state, [proposal], entities);
  return hydrated.proposals[0] || {};
};

export const getWTProposalsByState = (state, wtId, filter, entities) => {
  const proposalIds = fromByWT.getIds(state.byWT, wtId);
  const filtered = fromList.getIds(state.listByFilter[filter]);
  const results = proposalIds.filter(id => filtered.find(sId => sId === id));
  const hydrated = hydrateProposals(state, results, entities);
  return hydrated.proposals || [];
};

export const getProposalsByTag = (state, tagId, entities) => {
  const hydrated = hydrateProposals(
    state,
    fromByTag.getIds(state.byTag, tagId),
    entities,
  );
  return hydrated.proposals || [];
};

export const getPageInfo = (state, filter) => ({
  ...fromList.getPageInfo(state.listByFilter[filter]),
  //  isFetching: fromList.getIsFetching(state.listByFilter[filter]),
  //  errorMessage: fromList.getErrorMessage(state.listByFilter[filter]),
});
