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
  UPDATE_PROPOSAL_START,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_ERROR,
  LOAD_TAGS_START,
  LOAD_TAGS_ERROR,
  LOAD_TAGS_SUCCESS,
} from '../constants';
import {
  proposal as proposalSchema,
  proposalList as proposalListSchema,
  tagArray as tagArraySchema,
} from '../store/schema';
import { getProposalsIsFetching, getIsProposalFetching } from '../reducers';

const statementFields = `
    id
    likes
    text
    pollId
    createdAt
    updatedAt
    vote{
      id
      position
      voter{
        id
        name
        surname
        avatar
      }
      pollId
    }
    author{
      id
      name
      surname
      avatar
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
    voter{
      id
      name
      surname
      avatar
    }
  }
  ownStatement {${statementFields} deletedAt}
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
    withStatements
    unipolar
    thresholdRef
  }
  statements {${statementFields}}
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
    withStatements
    unipolar
    thresholdRef
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

const tagsQuery = `
query{
  tags{
    id
    text
  }
}
`;

const createProposalMutation = `
mutation( $title: String, $text:String,  $poll:PollInput $tags:[TagInput]){
  createProposal(proposal:{title:$title text:$text poll:$poll tags:$tags}){
    ${proposal}
    tags{
      id
      text
      count
    }
  }
}
`;

const updateProposalMutation = `
mutation($id:ID  $poll:PollInput $state:ProposalState ){
  updateProposal(proposal:{ id:$id poll:$poll state:$state }){
    ${proposal}
    tags{
      id
      text
      count
    }
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
      const normalizedData = normalize(data.createProposal, proposalSchema);
      // TODO change filter structure of reducer
      const filter = getFilter(data.createProposal.state);

      dispatch({
        type: CREATE_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
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

export function updateProposal(proposalData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_PROPOSAL_START,
      payload: {
        proposal: proposalData,
      },
    });
    try {
      const { data } = await graphqlRequest(updateProposalMutation, proposalData);
      const normalizedData = normalize(data.updateProposal, proposalSchema);
      // TODO change filter structure of reducer
      const filter = getFilter(data.updateProposal.state);

      dispatch({
        type: UPDATE_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_PROPOSAL_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function loadTags() {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_TAGS_START,
    });
    try {
      const { data } = await graphqlRequest(tagsQuery);
      const normalizedData = normalize(data.tags, tagArraySchema);
      dispatch({
        type: LOAD_TAGS_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_TAGS_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
