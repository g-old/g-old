import { combineReducers } from 'redux';
import proposals, * as fromProposal from './ui/proposals';
import statements, * as fromStatement from './ui/statements';
import users, * as fromUser from './ui/users';
import polls, * as fromPoll from './ui/polls';
import subscription, * as fromSubscription from './ui/subscription';
import activityCounter, * as fromActivityCounter from './ui/activities';
import loading from './ui/loading';
import pageInfo, * as fromPageInfo from './ui/pageInfo';
import { SESSION_LOGOUT_SUCCESS } from '../constants';
import comments, * as fromComment from './ui/comments';
import requests, * as fromRequest from './ui/requests';
import groups, * as fromGroup from './ui/groups';
import discussions, * as fromDiscussion from './ui/discussions';
import tags, * as fromTag from './ui/tags';
/* GENERATOR_IMPORTS */

const uiReducer = combineReducers({
  /* GENERATOR_COMBINE */
  requests,
  proposals,
  polls,
  statements,
  users,
  subscription,
  activityCounter,
  loading,
  pageInfo,
  comments,
  groups,
  discussions,
  tags,
});
export default (state, action) => {
  if (action.type === SESSION_LOGOUT_SUCCESS) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return uiReducer(state, action);
};

/* GENERATOR_EXPORTS */
export const getTagUpdates = state => fromTag.getStatus(state.tags);
export const getRequestUpdates = state => fromRequest.getStatus(state.requests);
export const getGroupUpdates = (state, id) =>
  fromGroup.getStatus(state.groups, id);

export const getProposalUpdates = (state, id) =>
  fromProposal.getStatus(state.proposals, id);

// TODO Different design
const getMutationPending = state => {
  if (state && state.mutations) {
    return state.mutations.pending;
  }
  return false;
};

const getMutationError = state => {
  if (state && state.mutations) {
    return state.mutations.error;
  }
  return null;
};

const getMutationSuccess = state => {
  if (state && state.mutations) {
    return state.mutations.success;
  }
  return false;
};
const getVotingListFetching = state => {
  if (state && state.pollFetching) {
    return state.pollFetching.isFetching;
  }
  return false;
};
const getVotingListError = state => {
  if (state && state.pollFetching) {
    return state.pollFetching.errorMessage;
  }
  return null;
};
export const getIsProposalFetching = (state, id) =>
  fromProposal.getProposal(state.proposals, id).isFetching;

export const getProposalSuccess = (state, id) =>
  fromProposal.getProposal(state.proposals, id).success;

export const getProposalErrorMessage = (state, id) =>
  fromProposal.getProposal(state.proposals, id).errorMessage;

export const getVotingListIsFetching = (state, id) =>
  getVotingListFetching(fromPoll.getPoll(state.polls, id));

export const getVotingListErrorMessage = (state, id) =>
  getVotingListError(fromPoll.getPoll(state.polls, id));

export const getVoteMutationIsPending = (state, id) =>
  getMutationPending(fromPoll.getPoll(state.polls, id));

export const getVoteMutationSuccess = (state, id) =>
  getMutationSuccess(fromPoll.getPoll(state.polls, id));

export const getVoteMutationError = (state, id) =>
  getMutationError(fromPoll.getPoll(state.polls, id));

export const getVoteUpdates = (state, id) =>
  fromPoll.getUpdates(state.polls, id);

export const getStatementUpdates = state =>
  fromStatement.getUpdates(state.statements);

export const getAccountUpdates = (state, id) =>
  fromUser.getStatus(state.users, id) || {};

export const getSubscription = state =>
  fromSubscription.getStatus(state.subscription);

export const getActivityCounter = state =>
  fromActivityCounter.getCounter(state.activityCounter);

export const getPageInfo = (state, queryStateTag) =>
  fromPageInfo.getPageInfo(state.pageInfo, queryStateTag);

export const getCommentUpdates = state =>
  fromComment.getUpdates(state.comments);

export const getDiscussionUpdates = (state, id) =>
  fromDiscussion.getStatus(state.discussions, id);
