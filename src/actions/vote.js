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
  console.log('UPDATEVOTE');
  console.log(vote);
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_VOTE_START,
      payload: {
        vote,
      },
    });
    try {
      const { data } = await graphqlRequest(updateVoteMutation, vote);
      console.log(data);

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
  console.log('DELETEVOTE');
  console.log(vote);
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: DELETE_VOTE_START,
      payload: {
        vote,
      },
    });
    try {
      const { data } = await graphqlRequest(deleteVoteMutation, vote);
      console.log(data);

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
