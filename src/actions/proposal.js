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
import { genProposalPageKey } from '../reducers/pageInfo';

import {
  proposal as proposalSchema,
  proposalList as proposalListSchema,
  tagArray as tagArraySchema,
} from '../store/schema';
import { getResourcePageInfo, getProposalUpdates } from '../reducers';
import { getFilter } from '../core/helpers';
import { subscriptionFields } from './subscription';
import { voteFields } from './vote';

const userFields = `
        id
        name
        surname
        thumbnail
`;

const statementFields = `
    id
    likes
    text
    pollId
    createdAt
    updatedAt
    deletedAt
    vote{
      ${voteFields}
    }
    author{
      ${userFields}
    }

`;
const optionFields = `
pos
order
description
numVotes
title
`;
export const pollFieldsForList = `
  id
  options{
    ${optionFields}
  }
  threshold
  extended
  multipleChoice
  startTime
  endTime
  allVoters
  numVotes
  closedAt
  mode{
    id
    withStatements
    unipolar
    thresholdRef
  }

`;
const pollFields = `{
  ${pollFieldsForList}
  likedStatements{
    id
    statementId
  }
  ownVote{
    ${voteFields}
  }
  ownStatement {${statementFields} deletedAt}
  followees{
    ${voteFields}
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
deletedAt
teamId
spokesman{
  ${userFields}
}
pollOne ${pollFields}
pollTwo ${pollFields}
image
approvalState
summary
`;

const query = `
  query ($id:ID $pollId: ID) {
    proposalDL (id:$id pollId:$pollId) {
      ${proposal}
      workteam{
        id
        logo
        displayName
      }
      subscription{
        ${subscriptionFields}
      }
      canVote
    }
  }
`;

const tagsQuery = `
query{
  tags{
    displayName
    id
    text
    count
    deName
    itName
    lldName
  }
}
`;

const proposalConnection = `
query ($state:String $first:Int, $after:String, $tagId:ID $workTeamId:ID $closed:Boolean $approvalState:Int) {
  proposalConnection (state:$state first:$first after:$after tagId:$tagId workTeamId:$workTeamId closed:$closed approvalState:$approvalState) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
        id
        title
        publishedAt
        state
        image
        teamId
        summary
        approvalState
        body
        workTeamId,
        tags{
          displayName
          id
          count
        }
        pollOne {${pollFieldsForList}}
        pollTwo {${pollFieldsForList}}
      }

      }
    }
}
`;

const createProposalMutation = `
mutation( $title: String, $text:String, $state:ProposalState $poll:PollInput $tags:[TagInput] $spokesmanId:ID $workTeamId:ID $summary:String $image:String){
  createProposal (proposal:{title:$title workTeamId:$workTeamId text:$text state:$state poll:$poll tags:$tags spokesmanId:$spokesmanId summary:$summary image:$image}){
    ${proposal}
    tags{
      id
      displayName
      count
    }
  }
}
`;

const updateProposalMutation = `
mutation($id:ID  $poll:PollInput $state:ProposalState $workTeamId:ID $approvalState:Int ){
  updateProposal (proposal:{ id:$id poll:$poll state:$state workTeamId:$workTeamId approvalState:$approvalState}){
    ${proposal}
    tags{
      id
      displayName
      count
    }
  }
}
`;

export function loadProposal({ id, pollId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // Dont fetch if pending
    const state = await getState();
    if (process.env.BROWSER) {
      if (id && getProposalUpdates(state, id).isFetching) {
        return false;
      }
    }

    dispatch({
      type: LOAD_PROPOSAL_START,
      id,
    });

    try {
      const { data } = await graphqlRequest(query, { id, pollId });
      const normalizedData = normalize(data.proposalDL, proposalSchema);
      // dispatch(addEntities(normalizedData.entities, 'all'));
      const filter = getFilter(data.proposalDL);
      dispatch({
        type: LOAD_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
        id,
      });
      return data.proposalDL.id;
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
  };
}

export function loadProposalsList({
  state,
  first,
  after,
  tagId,
  workTeamId,
  closed,
  approvalState,
}) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    // Dont fetch if pending
    const pageInfo = getResourcePageInfo(
      getState(),
      'proposals',
      genProposalPageKey({
        state,
        workteamId: workTeamId,
        closed,
        approvalState,
        tagId,
      }),
    ); // getProposalsPage(state, 'active'),
    if (process.env.BROWSER) {
      if (pageInfo.pending) {
        return false;
      }
    }
    const pageKey = genProposalPageKey({
      state,
      workteamId: workTeamId,
      approvalState,
      closed,
      tagId,
    });
    dispatch({
      type: LOAD_PROPOSAL_LIST_START,
      payload: {},
      filter: state,
      pageKey,
    });

    try {
      const { data } = await graphqlRequest(proposalConnection, {
        state,
        first,
        after,
        tagId,
        workTeamId,
        closed,
        approvalState,
      });
      const proposals = data.proposalConnection.edges.map(p => p.node);
      const normalizedData = normalize(proposals, proposalListSchema);
      // dispatch(addEntities(normalizedData.entities, state));
      dispatch({
        type: LOAD_PROPOSAL_LIST_SUCCESS,
        payload: normalizedData,
        filter: state,
        pagination: data.proposalConnection.pageInfo,
        savePageInfo: after != null,
        pageIndex: `${state}$${tagId || ''}`,
        pageKey,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_LIST_ERROR,
        payload: {
          error,
        },
        pageKey,

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
    const virtualId = '0000';
    if (process.env.BROWSER) {
      const state = getState();
      const updates = getProposalUpdates(state, virtualId);
      const isPending = updates.isFetching;

      if (isPending) {
        return false;
      }
    }
    dispatch({
      type: CREATE_PROPOSAL_START,
      id: virtualId,
    });
    try {
      const { data } = await graphqlRequest(
        createProposalMutation,
        proposalData,
      );
      // send files
      /*
      const formData = new FormData();
      let uploadData;
      if (files.constructor !== Array) {
        uploadData = [files];
      } else {
        uploadData = files;
      }

      uploadData.forEach(img => {
        formData.append('images', img);
      });

      formData.append('params', JSON.stringify(params));

      const resp = await fetch('/upload', {
        method: 'post',
        body: formData, // JSON.stringify(avatar),
        credentials: 'include',
      });

      if (resp.status !== 200) throw new Error(resp.statusText);
      const uploadedData = await resp.json(); */

      const normalizedData = normalize(data.createProposal, proposalSchema);
      // TODO change filter structure of reducer
      const filter = getFilter(data.createProposal);
      const proposalResult =
        normalizedData.entities.proposals[normalizedData.result];
      const poll = proposalResult.pollTwo || proposalResult.pollOne;

      dispatch({
        type: CREATE_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
        id: virtualId,
        info: `${normalizedData.result}/${poll}`,
      });
    } catch (error) {
      dispatch({
        type: CREATE_PROPOSAL_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
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
      id: proposalData.id,
    });
    try {
      const { data } = await graphqlRequest(
        updateProposalMutation,
        proposalData,
      );
      const normalizedData = normalize(data.updateProposal, proposalSchema);
      // TODO change filter structure of reducer
      const filter = getFilter(data.updateProposal);

      dispatch({
        type: UPDATE_PROPOSAL_SUCCESS,
        payload: normalizedData,
        filter,
        id: proposalData.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_PROPOSAL_ERROR,
        payload: {
          error,
        },
        id: proposalData.id,
        message: error.message || 'Something went wrong',
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
