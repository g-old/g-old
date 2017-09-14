/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  CREATE_VOTE_START,
  CREATE_VOTE_SUCCESS,
  CREATE_VOTE_ERROR,
  UPDATE_VOTE_START,
  UPDATE_VOTE_SUCCESS,
  UPDATE_VOTE_ERROR,
  DELETE_VOTE_START,
  DELETE_VOTE_SUCCESS,
  DELETE_VOTE_ERROR,
  LOAD_VOTES_START,
  LOAD_VOTES_SUCCESS,
  LOAD_VOTES_ERROR,
} from '../constants';
import { genStatusIndicators } from '../core/helpers';

import {
  voteList as voteListSchema,
  vote as voteSchema,
} from '../store/schema';
import { getVoteUpdates } from '../reducers';

const voteInfo = `{
  id
  position
  pollId
  voter{
    id
    name
    surname
    avatar
  }
}`;
const createVoteMutation = `
  mutation($pollId:ID! $position:Position!) {
    createVote (vote:{pollId:$pollId position:$position}) ${voteInfo}
  }
`;
const updateVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    updateVote (vote:{pollId:$pollId position:$position id:$id}) ${voteInfo}
  }
`;

const deleteVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    deleteVote (vote:{pollId:$pollId position:$position id:$id}) ${voteInfo}
  }
`;

const votesList = `
  query ($pollId:ID!) {
    votes (pollId:$pollId) {
    id
    position
    pollId
    voter{
      id
      name
      surname
      avatar
    }
    }
  }
`;

export function createVote(vote) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['vote']);
    dispatch({
      type: CREATE_VOTE_START,
      payload: {
        vote,
      },
      id: vote.pollId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createVoteMutation, vote);
      const normalized = normalize(data.createVote, voteSchema);
      dispatch({
        type: CREATE_VOTE_SUCCESS,
        payload: normalized,
        properties,
        id: vote.pollId,
      });
    } catch (error) {
      dispatch({
        type: CREATE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        id: vote.pollId,
        payload: error,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updateVote(vote, stmtId = null) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['vote']);

    dispatch({
      type: UPDATE_VOTE_START,
      id: vote.pollId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateVoteMutation, vote);
      const normalized = normalize(data.updateVote, voteSchema);
      dispatch({
        type: UPDATE_VOTE_SUCCESS,
        payload: normalized,
        info: stmtId,
        id: vote.pollId,
        properties,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        id: vote.pollId,
        payload: error,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function deleteVote(vote, stmtId = null) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['vote']);

    dispatch({
      type: DELETE_VOTE_START,
      id: vote.pollId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteVoteMutation, vote);
      const normalized = normalize(data.deleteVote, voteSchema);
      dispatch({
        type: DELETE_VOTE_SUCCESS,
        payload: normalized,
        info: stmtId,
        properties,
        id: vote.pollId,
      });
    } catch (error) {
      dispatch({
        type: DELETE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        payload: error,
        properties,
        id: vote.pollId,
      });
      return false;
    }

    return true;
  };
}

export function getVotes(pollId) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO check cache
    const status = getVoteUpdates(getState(), pollId).fetchVoters || {};
    if (status.pending) {
      return false;
    }

    const properties = genStatusIndicators(['fetchVoters']);
    dispatch({
      type: LOAD_VOTES_START,
      payload: {
        pollId,
      },
      id: pollId,
      properties,
    });

    try {
      const { data } = await graphqlRequest(votesList, { pollId });
      const normalized = normalize(data.votes, voteListSchema);
      dispatch({
        type: LOAD_VOTES_SUCCESS,
        payload: normalized,
        id: pollId,
        properties,
      });
    } catch (error) {
      dispatch({
        type: LOAD_VOTES_ERROR,
        message: error.message || 'Something went wrong',
        payload: error,
        id: pollId,
        properties,
      });
      return false;
    }

    return true;
  };
}
