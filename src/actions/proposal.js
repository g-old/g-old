/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
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
import { proposal as proposalSchema, proposalList as proposalListSchema } from '../store/schema';
import { getProposalsIsFetching, getIsProposalFetching } from '../reducers';

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
    tags{
      id
      text
      count
    }
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
const getFilter = (status) => {
  switch (status) {
    case 'accepted':
      return 'accepted';
    case 'proposed':
    case 'voting':
      return 'active';
    default:
      return 'repelled';

  }
};
export function loadProposal({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // Dont fetch if pending
    if (getIsProposalFetching(getState(), id)) {
      return false;
    }
    dispatch({
      type: LOAD_PROPOSAL_START,
      id,
    });

    try {
      const { data } = await graphqlRequest(query, { id });
      const normalizedData = normalize(data.proposalDL, proposalSchema);
      // dispatch(addEntities(normalizedData.entities, 'all'));
      const filter = getFilter(data.proposalDL.state);
      dispatch({
        type: LOAD_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
        id,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_ERROR,
        payload: {
          error,
        },
        id,
      });
      return false;
    }

    return true;
  };
}

export function loadProposalsList(state) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    // Dont fetch if pending
    if (getProposalsIsFetching(getState(), state)) {
      return false;
    }
    dispatch({
      type: LOAD_PROPOSAL_LIST_START,
      payload: {},
      filter: state,
    });

    try {
      const { data } = await graphqlRequest(listQuery, { state });
      const normalizedData = normalize(data.proposalsDL, proposalListSchema);
      // dispatch(addEntities(normalizedData.entities, state));
      dispatch({
        type: LOAD_PROPOSAL_LIST_SUCCESS,
        payload: normalizedData,
        filter: state,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_LIST_ERROR,
        payload: {
          error,
        },
        filter: state,
        message: error.message || 'Something went wrong',
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
