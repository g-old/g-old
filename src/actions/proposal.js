/* eslint-disable import/prefer-default-export */

import {
  LOAD_PROPOSAL_START,
LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
} from '../constants';

const statementFields = `{
    id
    title
    likes
    text
    pollId
    createdAt
    updatedAt
    vote{
      id
      position
    }
    author{
      id
      name
      surname
      avatar
    }
}
`;
const pollFields = `{
  id
  likedStatements{
    id
    statementId
  }
  ownVote{
    id
    position
  }
  ownStatement ${statementFields}
  upvotes
  downvotes
  threshold
  start_time
  end_time
  allVoters
  followees{
    id
    position
    voter{
      id
      name
      surname
    }
  }
  mode{
    id
    with_statements
    unipolar
    threshold_ref
  }
  statements ${statementFields}
}
`;

const query = `
  query ($id:ID!) {
    proposalDL (id:$id) {
      id
      title
      publishedAt
      state
      body
      votes
      pollOne ${pollFields}
      pollTwo ${pollFields}
    }
  }
`;


export function loadProposal({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO
    const { proposals } = getState().entities;
    if (proposals[id]) {
      // TODO: Add checks to ensure we have a valid, cached object.
      return true;
    }
    dispatch({
      type: LOAD_PROPOSAL_START,
      payload: {
        id,
      },
    });

    try {
      const { data } = await graphqlRequest(query, { id });
      dispatch({
        type: LOAD_PROPOSAL_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_ERROR,
        payload: {
          id,
          error,
        },
      });
      return false;
    }

    return true;
  };
}
