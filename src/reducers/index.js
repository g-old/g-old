import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import layoutSize, * as fromResponsive from './responsive';
import intl, * as fromIntl from './intl';
import entities, * as fromEntity from './entities';
import ui, * as fromUi from './ui';
import consent from './consent';
import statistics from './statistics';
import system from './system';
import pageInfo, * as fromPageInfo from './pageInfo';
import scrollToCounter from './scrollToCounter';

export default combineReducers({
  user,
  runtime,
  layoutSize,
  intl,
  entities,
  ui,
  consent,
  statistics,
  system,
  pageInfo,
  scrollToCounter,
});

/* GENERATOR */

export const getUploadStatus = state => fromUi.getUploadStatus(state.ui);
export const getAllProposals = state =>
  fromEntity.getAllProposals(state.entities);

export const getLayoutSize = state =>
  fromResponsive.getLayoutSize(state.layoutSize);
export const getResourcePageInfo = (state, resource, filter) =>
  fromPageInfo.getPageInfo(state.pageInfo, resource, filter);
export const getScrollCount = state => state.scrollToCounter;
export const getDiscussionPageInfo = (state, filter) =>
  fromEntity.getDiscussionPageInfo(state.entities, filter);
export const getWTDiscussionsByState = (state, id, filter) =>
  fromEntity.getWTDiscussionsByState(state.entities, id, filter);
export const getWTProposalsByState = (state, id, filter) =>
  fromEntity.getWTProposalsByState(state.entities, id, filter);
export const getMessagesByChannel = (state, channelId) =>
  fromEntity.getMessagesByChannel(state.entities, channelId);
export const getMessageUpdates = state => fromUi.getMessageUpdates(state.ui);
export const getAllMessages = state =>
  fromEntity.getAllMessages(state.entities);
export const getMessage = (state, id) =>
  fromEntity.getMessage(state.entities, id);

export const getAllNotifications = state =>
  fromEntity.getAllNotifications(state.entities);

export const getNotification = (state, filter) =>
  fromEntity.getNotification(state.entities, filter);

export const getNotificationsStatus = (state, filter) =>
  fromEntity.getNotificationsStatus(state.entities, filter);

export const getNotificationUpdates = (state, filter) =>
  fromUi.getNotificationUpdates(state.ui, filter);

export const getSubscription = (state, filter) =>
  fromEntity.getSubscription(state.entities, filter);

export const getSubscriptionUpdates = (state, filter) =>
  fromUi.getSubscriptionUpdates(state.ui, filter);
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

export const getProposalUpdates = (state, id) =>
  fromUi.getProposalUpdates(state.ui, id);

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

export const getPushSubscription = state => fromUi.getSubscription(state.ui);

export const getActivityCounter = state => fromUi.getActivityCounter(state.ui);

export const getWorkTeams = state => fromEntity.getWorkTeams(state.entities);

export const getWorkTeam = (state, id) =>
  fromEntity.getWorkTeam(state.entities, id);

export const getWorkTeamsIsFetching = state =>
  fromEntity.getWorkTeamsIsFetching(state.entities);

export const getWorkTeamsErrorMessage = state =>
  fromEntity.getWorkTeamsErrorMessage(state.entities);

export const getWorkTeamStatus = (state, id) =>
  fromUi.getWorkTeamUpdates(state.ui, id);

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
export const getDroneBranch = state => state.system.droneBranch;
export const getDroneBuild = state => state.system.droneBuild;
