import { combineReducers } from 'redux';
import users, * as fromUsers from './users';
import statements, * as fromStatements from './statements';
import polls from './polls';
import proposals, * as fromProposals from './proposals';
import roles from './roles';
import tags, * as fromTags from './tags';
import pollingModes from './pollingModes';
import votes from './votes';
import messages from './messages';
import statementLikes from './statementLikes';
import flaggedStatements, * as fromFlaggedStatements from './flaggedStatements';
import activities, * as fromActivities from './activities';
import followees, * as fromFollowees from './followees';
import workTeams, * as fromWorkTeams from './workTeams';
import logs, * as fromLogs from './logs';
import discussions, * as fromDiscussions from './discussions';
import comments, * as fromComments from './comments';
import requests, * as fromRequests from './requests';
import proposalStatus from './proposalStatus';

import subscriptions, * as fromSubscriptions from './subscriptions';
import notifications, * as fromNotifications from './notifications';
/* GENERATOR */

export default combineReducers({
  /* GENERATOR_COMBINED */
  notifications,
  subscriptions,
  requests,
  users,
  statements,
  polls,
  proposals,
  roles,
  tags,
  pollingModes,
  votes,
  statementLikes,
  flaggedStatements,
  activities,
  followees,
  workTeams,
  messages,
  logs,
  discussions,
  comments,
  proposalStatus,
});

/* GENERATOR_EXPORTS */
export const getNotification = (state, id) =>
  fromNotifications.getEntity(state.notifications, id, state);

export const getAllNotifications = state =>
  fromNotifications.getAll(state.notifications, state);

export const getNotificationsStatus = (state, filter) =>
  fromNotifications.getStatus(state.notifications, filter);
export const getSubscription = (state, id) =>
  fromSubscriptions.getEntity(state.subscriptions, id, state);

export const getSubscriptionsStatus = (state, filter) =>
  fromSubscriptions.getStatus(state.subscriptions, filter);
export const getRequest = (state, id) =>
  fromRequests.getEntity(state.requests, id, state);

export const getVisibleRequests = (state, filter) =>
  fromRequests.getVisible(state.requests, filter, state);

export const getRequestsStatus = (state, filter) =>
  fromRequests.getStatus(state.requests, filter);

export const getVisibleProposals = (state, filter) =>
  fromProposals.getVisibleProposals(state.proposals, filter, state);

export const getProposalsIsFetching = (state, filter) =>
  fromProposals.getIsFetching(state.proposals, filter);

export const getProposalsErrorMessage = (state, filter) =>
  fromProposals.getErrorMessage(state.proposals, filter);

export const getProposalsPage = (state, filter) =>
  fromProposals.getPageInfo(state.proposals, filter);

export const getComment = (state, id) =>
  fromComments.getComment(state.comments, id, state);

export const getUser = (state, id) => fromUsers.getUser(state.users, id, state);

export const getProposal = (state, id) =>
  fromProposals.getProposal(state.proposals, id, state);

export const getProposalsByTag = (state, tagId) =>
  fromProposals.getProposalsByTag(state.proposals, tagId, state);

export const getVisibleUsers = (state, filter) =>
  fromUsers.getVisibleUsers(state.users, filter, state);

export const getUsersStatus = (state, filter) =>
  fromUsers.getStatus(state.users, filter);

export const getVisibleFlags = (state, filter) =>
  fromFlaggedStatements.getVisibleFlags(state.flaggedStatements, filter, state);

export const getFlagsIsFetching = (state, filter) =>
  fromFlaggedStatements.getIsFetching(state.flaggedStatements, filter);

export const getFlagsPage = (state, filter) =>
  fromFlaggedStatements.getPageInfo(state.flaggedStatements, filter);

export const getFlagsErrorMessage = (state, filter) =>
  fromFlaggedStatements.getErrorMessage(state.flaggedStatements, filter);

export const getActivities = (state, filter) =>
  fromActivities.getActivities(state.activities, filter, state);

export const getLogs = state => fromLogs.getLogs(state.logs, state);

export const getLogIsFetching = state => fromLogs.getIsFetching(state.logs);

export const getLogErrorMessage = state => fromLogs.getErrorMessage(state.logs);

export const getFeedIsFetching = (state, filter) =>
  fromActivities.getIsFetching(state.activities, filter);

export const getFeedErrorMessage = (state, filter) =>
  fromActivities.getErrorMessage(state.activities, filter);

export const getTags = state => fromTags.getTags(state.tags);

export const getTag = (state, id) => fromTags.getTag(state.tags, id);

export const getFolloweeVotesByPoll = (state, id) =>
  fromFollowees.getFolloweeVotesByPoll(state, id);

export const getFollowees = state => fromFollowees.getFollowees(state);

export const getAllStatementsByPoll = (state, id) =>
  fromStatements.getAllStatementsByPoll(state.statements, id, state);

export const getVisibibleStatementsByPoll = (state, id, filter) =>
  fromStatements.getVisibibleStatementsByPoll(
    state.statements,
    id,
    state,
    filter,
  );

export const getWorkTeams = state =>
  fromWorkTeams.getWorkTeams(state.workTeams, state);

export const getWorkTeamsIsFetching = state =>
  fromWorkTeams.getIsFetching(state.workTeams);

export const getWorkTeamsErrorMessage = state =>
  fromWorkTeams.getErrorMessage(state.workTeams);

export const getWorkTeam = (state, id) =>
  fromWorkTeams.getWorkTeam(state.workTeams, id, state);

export const getDiscussion = (state, id) =>
  fromDiscussions.getDiscussion(state.discussions, id, state);

export const getIsDiscussionFetching = state =>
  fromDiscussions.getIsFetching(state.discussions);

export const getDiscussionError = state =>
  fromDiscussions.getErrorMessage(state.discussions);
