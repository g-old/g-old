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

import { voteList as voteListSchema, vote as voteSchema } from '../store/schema';
import { getVotingListIsFetching } from '../reducers';

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
    createVote(vote:{pollId:$pollId position:$position}) ${voteInfo}
  }
`;
const updateVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    updateVote(vote:{pollId:$pollId position:$position id:$id}) ${voteInfo}
  }
`;

const deleteVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    deleteVote( vote:{pollId:$pollId position:$position id:$id}) ${voteInfo}
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
    dispatch({
      type: CREATE_VOTE_START,
      payload: {
        vote,
      },
      pollId: vote.pollId,
    });
    try {
      const { data } = await graphqlRequest(createVoteMutation, vote);
      const normalized = normalize(data.createVote, voteSchema);
      dispatch({
        type: CREATE_VOTE_SUCCESS,
        payload: normalized,
      });
    } catch (error) {
      dispatch({
        type: CREATE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        pollId: vote.pollId,
        payload: error,
      });
      return false;
    }

    return true;
  };
}

export function updateVote(vote) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_VOTE_START,
      pollId: vote.pollId,
    });
    try {
      const { data } = await graphqlRequest(updateVoteMutation, vote);
      const normalized = normalize(data.updateVote, voteSchema);
      dispatch({
        type: UPDATE_VOTE_SUCCESS,
        payload: normalized,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        pollId: vote.pollId,
        payload: error,
      });
      return false;
    }

    return true;
  };
}

export function deleteVote(vote) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: DELETE_VOTE_START,
      pollId: vote.pollId,
    });
    try {
      const { data } = await graphqlRequest(deleteVoteMutation, vote);
      const normalized = normalize(data.deleteVote, voteSchema);
      dispatch({
        type: DELETE_VOTE_SUCCESS,
        payload: normalized,
      });
    } catch (error) {
      dispatch({
        type: DELETE_VOTE_ERROR,
        message: error.message || 'Something went wrong',
        payload: error,
        pollId: vote.pollId,
      });
      return false;
    }

    return true;
  };
}

export function getVotes(pollId) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO check cache

    if (getVotingListIsFetching(getState(), pollId)) {
      return false;
    }
    dispatch({
      type: LOAD_VOTES_START,
      payload: {
        pollId,
      },
      id: pollId,
    });

    try {
      const { data } = await graphqlRequest(votesList, { pollId });
      const normalized = normalize(data.votes, voteListSchema);
      dispatch({
        type: LOAD_VOTES_SUCCESS,
        payload: normalized,
        id: pollId,
      });
    } catch (error) {
      dispatch({
        type: LOAD_VOTES_ERROR,
        message: error.message || 'Something went wrong',
        payload: error,
        id: pollId,
      });
      return false;
    }

    return true;
  };
}
