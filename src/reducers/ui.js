import { combineReducers } from 'redux';
import proposals, * as fromProposal from './ui/proposals';
import statements, * as fromStatement from './ui/statements';
import users, * as fromUser from './ui/users';
import polls, * as fromPoll from './ui/polls';
import subscription, * as fromPushSubscription from './ui/subscription';
import activityCounter, * as fromActivityCounter from './ui/activities';
import loading from './ui/loading';
import pageInfo, * as fromPageInfo from './ui/pageInfo';
import { SESSION_LOGOUT_SUCCESS } from '../constants';
import comments, * as fromComment from './ui/comments';
import requests, * as fromRequest from './ui/requests';
import workTeams, * as fromWorkTeam from './ui/workTeams';
import discussions, * as fromDiscussion from './ui/discussions';
import tags, * as fromTag from './ui/tags';
import subscriptions, * as fromSubscription from './ui/subscriptions';
import notifications, * as fromNotification from './ui/notifications';
import messages, * as fromMessage from './ui/messages';

/* GENERATOR_IMPORTS */

const uiReducer = combineReducers({
  /* GENERATOR_COMBINE */
  notifications,
  subscriptions,
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
  workTeams,
  discussions,
  tags,
  messages,
});
export default (state, action) => {
  if (action.type === SESSION_LOGOUT_SUCCESS) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return uiReducer(state, action);
};

/* GENERATOR_EXPORTS */

export const getVoteUpdates = state => fromPoll.getStatus(state.polls);

export const getMessageUpdates = state => fromMessage.getStatus(state.messages);

export const getNotificationUpdates = state =>
  fromNotification.getStatus(state.notifications);
export const getSubscriptionUpdates = state =>
  fromSubscription.getStatus(state.subscriptions);
export const getTagUpdates = state => fromTag.getStatus(state.tags);
export const getRequestUpdates = state => fromRequest.getStatus(state.requests);
export const getWorkTeamUpdates = (state, id) =>
  fromWorkTeam.getStatus(state.workTeams, id);

export const getProposalUpdates = (state, id) =>
  fromProposal.getStatus(state.proposals, id);

export const getStatementUpdates = state =>
  fromStatement.getUpdates(state.statements);

export const getAccountUpdates = (state, id) =>
  fromUser.getStatus(state.users, id) || {};

export const getSubscription = state =>
  fromPushSubscription.getStatus(state.subscription);

export const getActivityCounter = state =>
  fromActivityCounter.getCounter(state.activityCounter);

export const getPageInfo = (state, queryStateTag) =>
  fromPageInfo.getPageInfo(state.pageInfo, queryStateTag);

export const getCommentUpdates = state =>
  fromComment.getUpdates(state.comments);

export const getDiscussionUpdates = (state, id) =>
  fromDiscussion.getStatus(state.discussions, id);
