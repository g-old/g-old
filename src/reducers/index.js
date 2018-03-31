import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import intl, * as fromIntl from './intl';
import entities, * as fromEntity from './entities';
import ui, * as fromUi from './ui';
import consent from './consent';
import statistics from './statistics';
import platform, * as fromPlatform from './platform';
import system from './system';

export default combineReducers({
  user,
  runtime,
  intl,
  entities,
  ui,
  consent,
  statistics,
  platform,
  system,
});

/* GENERATOR */

export const getPlatform = state => fromPlatform.getPlatform(state);

export const getPlatformUpdates = state => fromUi.getPlatformUpdates(state.ui);
export const getVisibleRequests = (state, filter) =>
  fromEntity.getVisibleRequests(state.entities, filter);

export const getRequest = (state, filter) =>
  fromEntity.getRequest(state.entities, filter);

export const getRequestsStatus = (state, filter) =>
  fromEntity.getRequestsStatus(state.entities, filter);

export const getRequestUpdates = (state, filter) =>
  fromUi.getRequestUpdates(state.ui, filter);

export const getVisibleProposals = (state, filter) =>
  fromEntity.getVisibleProposals(state.entities, filter);

export const getProposalsIsFetching = (state, filter) =>
  fromEntity.getProposalsIsFetching(state.entities, filter);

export const getProposalsErrorMessage = (state, filter) =>
  fromEntity.getProposalsErrorMessage(state.entities, filter);

export const getProposalsPage = (state, filter) =>
  fromEntity.getProposalsPage(state.entities, filter);

export const getSessionUser = state =>
  fromEntity.getUser(state.entities, state.user);

export const getProposal = (state, id) =>
  fromEntity.getProposal(state.entities, id);

export const getComment = (state, id) =>
  fromEntity.getComment(state.entities, id);

export const getProposalsByTag = (state, tagId) =>
  fromEntity.getProposalsByTag(state.entities, tagId);

export const getIsProposalUpdates = (state, id) =>
  fromUi.getIsProposalFetching(state.ui, id);

export const getProposalSuccess = (state, id) =>
  fromUi.getProposalSuccess(state.ui, id);

export const getIsProposalFetching = (state, id) =>
  fromUi.getIsProposalFetching(state.ui, id);

export const getProposalUpdates = (state, id) =>
  fromUi.getProposalUpdates(state.ui, id);

export const getProposalErrorMessage = (state, id) =>
  fromUi.getProposalErrorMessage(state.ui, id);

export const getVotingListIsFetching = (state, id) =>
  fromUi.getVotingListIsFetching(state.ui, id);

export const getVotingListErrorMessage = (state, id) =>
  fromUi.getVotingListErrorMessage(state.ui, id);

export const getVoteUpdates = (state, id) =>
  fromUi.getVoteUpdates(state.ui, id);

export const getStatementUpdates = state =>
  fromUi.getStatementUpdates(state.ui);

export const getVisibleUsers = (state, filter) =>
  fromEntity.getVisibleUsers(state.entities, filter);

export const getUsersStatus = (state, filter) =>
  fromEntity.getUsersStatus(state.entities, filter);

export const getAccountUpdates = (state, id) =>
  fromUi.getAccountUpdates(state.ui, id);

export const getLocale = state => fromIntl.getLocale(state.intl);

export const getMessages = state => fromIntl.getMessages(state.intl);

export const getUser = (state, id) => fromEntity.getUser(state.entities, id);

export const getVisibleFlags = (state, filter) =>
  fromEntity.getVisibleFlags(state.entities, filter);

export const getFlagsIsFetching = (state, filter) =>
  fromEntity.getFlagsIsFetching(state.entities, filter);

export const getFlagsErrorMessage = (state, filter) =>
  fromEntity.getFlagsErrorMessage(state.entities, filter);

export const getFlagsPage = (state, filter) =>
  fromEntity.getFlagsPage(state.entities, filter);

export const getActivities = (state, filter) =>
  fromEntity.getActivities(state.entities, filter);

export const getLogs = state => fromEntity.getLogs(state.entities);

export const getLogIsFetching = state =>
  fromEntity.getLogIsFetching(state.entities);

export const getLogErrorMessage = state =>
  fromEntity.getLogErrorMessage(state.entities);

export const getFeedIsFetching = (state, filter) =>
  fromEntity.getFeedIsFetching(state.entities, filter);

export const getFeedErrorMessage = (state, filter) =>
  fromEntity.getFeedErrorMessage(state.entities, filter);

export const getTags = state => fromEntity.getTags(state.entities);

export const getTagStatus = state => fromUi.getTagUpdates(state.ui);

export const getTag = (state, id) => fromEntity.getTag(state.entities, id);

export const getFolloweeVotesByPoll = (state, id) =>
  fromEntity.getFolloweeVotesByPoll(state.entities, id);

export const getFollowees = state => fromEntity.getFollowees(state.entities);

export const getAllStatementsByPoll = (state, id) =>
  fromEntity.getAllStatementsByPoll(state.entities, id);

export const getVisibibleStatementsByPoll = (state, id, filter) =>
  fromEntity.getVisibibleStatementsByPoll(state.entities, id, filter);

export const getSubscription = state => fromUi.getSubscription(state.ui);

export const getActivityCounter = state => fromUi.getActivityCounter(state.ui);

export const getGroups = state => fromEntity.getGroups(state.entities);

export const getGroup = (state, id) => fromEntity.getGroup(state.entities, id);

export const getGroupsIsFetching = state =>
  fromEntity.getGroupsIsFetching(state.entities);

export const getGroupsErrorMessage = state =>
  fromEntity.getGroupsErrorMessage(state.entities);

export const getGroupStatus = (state, id) =>
  fromUi.getGroupUpdates(state.ui, id);

export const getStatistics = state => state.statistics;

export const getPageInfo = (state, queryStateTag) =>
  fromUi.getPageInfo(state.ui, queryStateTag);

export const getDiscussion = (state, id) =>
  fromEntity.getDiscussion(state.entities, id, state);

export const getIsDiscussionFetching = state =>
  fromEntity.getIsDiscussionFetching(state.entities);

export const getDiscussionError = state =>
  fromEntity.getDiscussionError(state.entities);

export const getCommentUpdates = state => fromUi.getCommentUpdates(state.ui);

export const getDiscussionUpdates = state =>
  fromUi.getDiscussionUpdates(state.ui);

export const getConsent = state => state.consent;

export const getRecaptchaKey = state => state.system.recaptchaKey;
export const getWebPushKey = state => state.system.webPushKey;
export const getDroneCommit = state => state.system.droneCommit;
export const getDroneBuild = state => state.system.droneBuild;
