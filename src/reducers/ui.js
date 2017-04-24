import { combineReducers } from 'redux';
import proposals, * as fromProposal from './ui/proposals';
import statements, * as fromStatement from './ui/statements';
import users, * as fromUser from './ui/users';
import polls, * as fromPoll from './ui/polls';
import { SESSION_LOGOUT_SUCCESS } from '../constants';

/* export default combineReducers({
  proposals,
  polls,
  statements,
  users,
}); */
const uiReducer = combineReducers({
  proposals,
  polls,
  statements,
  users,
});
export default (state, action) => {
  if (action.type === SESSION_LOGOUT_SUCCESS) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return uiReducer(state, action);
};

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

export const getStatementMutationIsPending = (state, id) =>
  fromStatement.getStatementIsPending(state.statements, id);

export const getStatementMutationSuccess = (state, id) =>
  fromStatement.getStatementSuccess(state.statements, id);

export const getStatementMutationError = (state, id) =>
  fromStatement.getStatementError(state.statements, id);

export const getAccountUpdates = (state, id) => fromUser.getStatus(state.users, id) || {};
