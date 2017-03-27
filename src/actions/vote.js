/* eslint-disable import/prefer-default-export */
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

const createVoteMutation = `
  mutation($pollId:ID! $position:Position!) {
    createVote(vote:{pollId:$pollId position:$position}) {
      id
      position
      pollId
    }
  }
`;
const updateVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    updateVote(vote:{pollId:$pollId position:$position id:$id}) {
      id
      position
      pollId
    }
  }
`;

const deleteVoteMutation = `
  mutation($pollId:ID! $position:Position! $id:ID) {
    deleteVote( vote:{pollId:$pollId position:$position id:$id}) {
      id
      position
      pollId
    }
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
  console.log('CREATEVOTE');
  console.log(vote);
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_VOTE_START,
      payload: {
        vote,
      },
    });
    try {
      const { data } = await graphqlRequest(createVoteMutation, vote);
      console.log(data);

      dispatch({
        type: CREATE_VOTE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_VOTE_ERROR,
        payload: {
          error,
        },
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
      payload: {
        vote,
      },
    });
    try {
      const { data } = await graphqlRequest(updateVoteMutation, vote);
      dispatch({
        type: UPDATE_VOTE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_VOTE_ERROR,
        payload: {
          error,
        },
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
      payload: {
        vote,
      },
    });
    try {
      const { data } = await graphqlRequest(deleteVoteMutation, vote);
      dispatch({
        type: DELETE_VOTE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: DELETE_VOTE_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function getVotes(pollId) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO check cache

    dispatch({
      type: LOAD_VOTES_START,
      payload: {
        pollId,
      },
    });

    try {
      const { data } = await graphqlRequest(votesList, { pollId });
      dispatch({
        type: LOAD_VOTES_SUCCESS,
        payload: { data, pollId },
      });
    } catch (error) {
      dispatch({
        type: LOAD_VOTES_ERROR,
        payload: {
          pollId,
          error,
        },
      });
      return false;
    }

    return true;
  };
}
