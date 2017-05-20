import { combineReducers } from 'redux';
import users, * as fromUsers from './users';
import statements, * as fromStatements from './statements';
import polls from './polls';
import proposals, * as fromProposals from './proposals';
import roles from './roles';
import tags, * as fromTags from './tags';
import pollingModes from './pollingModes';
import votes from './votes';
import statementLikes from './statementLikes';
import flaggedStatements, * as fromFlaggedStatements from './flaggedStatements';
import activities, * as fromActivities from './activities';
import followees, * as fromFollowees from './followees';

export default combineReducers({
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
});

export const getVisibleProposals = (state, filter) =>
  fromProposals.getVisibleProposals(state.proposals, filter, state);

export const getProposalsIsFetching = (state, filter) =>
  fromProposals.getIsFetching(state.proposals, filter);

export const getProposalsErrorMessage = (state, filter) =>
  fromProposals.getErrorMessage(state.proposals, filter);

export const getUser = (state, id) => fromUsers.getUser(state.users, id, state);

export const getProposal = (state, id) => fromProposals.getProposal(state.proposals, id, state);

export const getVisibleUsers = (state, filter) =>
  fromUsers.getVisibleUsers(state.users, filter, state);

export const getUsersIsFetching = (state, filter) => fromUsers.getIsFetching(state.users, filter);

export const getUsersErrorMessage = (state, filter) =>
  fromUsers.getErrorMessage(state.users, filter);

export const getFlaggedStatements = state =>
  fromFlaggedStatements.getStatements(state.flaggedStatements, state);

export const getActivities = state => fromActivities.getActivities(state.activities, state);

export const getFeedIsFetching = state => fromActivities.getIsFetching(state.activities);

export const getFeedErrorMessage = state => fromActivities.getErrorMessage(state.activities);

export const getTags = state => fromTags.getTags(state.tags);

export const getFolloweeVotesByPoll = (state, id) =>
  fromFollowees.getFolloweeVotesByPoll(state, id);

export const getFollowees = state => fromFollowees.getFollowees(state);

export const getAllStatementsByPoll = (state, id) =>
  fromStatements.getAllStatementsByPoll(state.statements, id, state);

export const getVisibibleStatementsByPoll = (state, id, filter) =>
  fromStatements.getVisibibleStatementsByPoll(state.statements, id, state, filter);
