import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import intl, * as fromIntl from './intl';
import entities, * as fromEntity from './entities';
import ui, * as fromUi from './ui';

export default combineReducers({
  user,
  runtime,
  intl,
  entities,
  ui,
});

export const getVisibleProposals = (state, filter) =>
  fromEntity.getVisibleProposals(state.entities, filter);

export const getProposalsIsFetching = (state, filter) =>
  fromEntity.getProposalsIsFetching(state.entities, filter);

export const getProposalsErrorMessage = (state, filter) =>
  fromEntity.getProposalsErrorMessage(state.entities, filter);

export const getSessionUser = state => fromEntity.getUser(state.entities, state.user);

export const getProposal = (state, id) => fromEntity.getProposal(state.entities, id);

export const getIsProposalFetching = (state, id) => fromUi.getIsProposalFetching(state.ui, id);

export const getProposalErrorMessage = (state, id) => fromUi.getProposalErrorMessage(state.ui, id);

export const getVotingListIsFetching = (state, id) => fromUi.getVotingListIsFetching(state.ui, id);

export const getVotingListErrorMessage = (state, id) =>
  fromUi.getVotingListErrorMessage(state.ui, id);

export const getVoteMutationIsPending = (state, id) =>
  fromUi.getVoteMutationIsPending(state.ui, id);

export const getVoteMutationSuccess = (state, id) => fromUi.getVoteMutationSuccess(state.ui, id);

export const getVoteMutationError = (state, id) => fromUi.getVoteMutationError(state.ui, id);

export const getStatementMutationIsPending = (state, id) =>
  fromUi.getStatementMutationIsPending(state.ui, id);

export const getStatementMutationSuccess = (state, id) =>
  fromUi.getStatementMutationSuccess(state.ui, id);

export const getStatementMutationError = (state, id) =>
  fromUi.getStatementMutationError(state.ui, id);

export const getVisibleUsers = (state, filter) =>
  fromEntity.getVisibleUsers(state.entities, filter);

export const getUsersIsFetching = (state, filter) =>
  fromEntity.getUsersIsFetching(state.entities, filter);

export const getUsersErrorMessage = (state, filter) =>
  fromEntity.getUsersErrorMessage(state.entities, filter);

export const getAccountUpdates = (state, id) => fromUi.getAccountUpdates(state.ui, id);

export const getLocale = state => fromIntl.getLocale(state.intl);

export const getMessages = state => fromIntl.getMessages(state.intl);

export const getUser = (state, id) => fromEntity.getUser(state.entities, id);

export const getFlaggedStatements = state => fromEntity.getFlaggedStatements(state.entities);

export const getActivities = state => fromEntity.getActivities(state.entities);

export const getFeedIsFetching = state => fromEntity.getFeedIsFetching(state.entities);

export const getFeedErrorMessage = state => fromEntity.getFeedErrorMessage(state.entities);

export const getTags = state => fromEntity.getTags(state.entities);
