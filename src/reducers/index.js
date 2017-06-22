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

export const getProposalsPage = (state, filter) =>
  fromEntity.getProposalsPage(state.entities, filter);

export const getSessionUser = state => fromEntity.getUser(state.entities, state.user);

export const getProposal = (state, id) => fromEntity.getProposal(state.entities, id);

export const getIsProposalFetching = (state, id) => fromUi.getIsProposalFetching(state.ui, id);

export const getProposalSuccess = (state, id) => fromUi.getProposalSuccess(state.ui, id);

export const getProposalErrorMessage = (state, id) => fromUi.getProposalErrorMessage(state.ui, id);

export const getVotingListIsFetching = (state, id) => fromUi.getVotingListIsFetching(state.ui, id);

export const getVotingListErrorMessage = (state, id) =>
  fromUi.getVotingListErrorMessage(state.ui, id);

export const getVoteUpdates = (state, id) => fromUi.getVoteUpdates(state.ui, id);

export const getStatementUpdates = state => fromUi.getStatementUpdates(state.ui);

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

export const getVisibleFlags = (state, filter) =>
  fromEntity.getVisibleFlags(state.entities, filter);

export const getFlagsIsFetching = (state, filter) =>
  fromEntity.getFlagsIsFetching(state.entities, filter);

export const getFlagsErrorMessage = (state, filter) =>
  fromEntity.getFlagsErrorMessage(state.entities, filter);

export const getFlagsPage = (state, filter) => fromEntity.getFlagsPage(state.entities, filter);

export const getActivities = state => fromEntity.getActivities(state.entities);

export const getFeedIsFetching = state => fromEntity.getFeedIsFetching(state.entities);

export const getFeedErrorMessage = state => fromEntity.getFeedErrorMessage(state.entities);

export const getTags = state => fromEntity.getTags(state.entities);

export const getFolloweeVotesByPoll = (state, id) =>
  fromEntity.getFolloweeVotesByPoll(state.entities, id);

export const getFollowees = state => fromEntity.getFollowees(state.entities);

export const getAllStatementsByPoll = (state, id) =>
  fromEntity.getAllStatementsByPoll(state.entities, id);

export const getVisibibleStatementsByPoll = (state, id, filter) =>
  fromEntity.getVisibibleStatementsByPoll(state.entities, id, filter);
