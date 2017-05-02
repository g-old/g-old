import { combineReducers } from 'redux';
import users, * as fromUsers from './users';
import statements from './statements';
import polls from './polls';
import proposals, * as fromProposals from './proposals';
import roles from './roles';
import tags from './tags';
import pollingModes from './pollingModes';
import votes from './votes';
import statementLikes from './statementLikes';
import flaggedStatements, * as fromFlaggedStatements from './flaggedStatements';

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
