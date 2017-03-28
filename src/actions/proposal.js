/* eslint-disable import/prefer-default-export */

import {
  LOAD_PROPOSAL_START,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
  LOAD_PROPOSAL_LIST_START,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_LIST_ERROR,
  CREATE_PROPOSAL_START,
  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_ERROR,
} from '../constants';

const statementFields = `{
    id
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
    pollId
  }
  ownStatement ${statementFields}
  upvotes
  downvotes
  threshold
  closed_at
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

const proposal = `
id
title
publishedAt
state
body
votes
pollOne ${pollFields}
pollTwo ${pollFields}
`;

const query = `
  query ($id:ID!) {
    proposalDL (id:$id) {
      ${proposal}
    }
  }
`;

const pollFieldsForList = `{
  id
  upvotes
  downvotes
  threshold
  start_time
  end_time
  allVoters
  mode{
    id
    with_statements
    unipolar
    threshold_ref
  }
}
`;

const listQuery = `
query ($state:String) {
  proposalsDL (state:$state) {
    id
    title
    publishedAt
    state
    body
    pollOne ${pollFieldsForList}
    pollTwo ${pollFieldsForList}
  }
}
`;

const createProposalMutation = `
mutation($pollingModeId:ID $title: String, $text:String){
  createProposal(proposal:{title:$title, text:$text pollingModeId:$pollingModeId}){
    ${proposal}
  }
}
`;

export function loadProposal({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO
    const { proposals } = getState().entities;
    if (proposals[id] && proposals[id].statements) {
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

export function loadProposalsList(state) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_PROPOSAL_LIST_START,
      payload: {
        state,
      },
    });

    try {
      const { data } = await graphqlRequest(listQuery, { state });
      dispatch({
        type: LOAD_PROPOSAL_LIST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_LIST_ERROR,
        payload: {
          state,
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function createProposal(proposalData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_PROPOSAL_START,
      payload: {
        proposal: proposalData,
      },
    });
    try {
      const { data } = await graphqlRequest(createProposalMutation, proposalData);
      dispatch({
        type: CREATE_PROPOSAL_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_PROPOSAL_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
