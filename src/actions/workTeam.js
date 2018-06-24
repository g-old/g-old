/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { pollFieldsForList } from './proposal';
import { depaginate } from '../core/helpers';

import {
  LOAD_WORKTEAMS_START,
  LOAD_WORKTEAMS_ERROR,
  LOAD_WORKTEAMS_SUCCESS,
  LOAD_WORKTEAM_START,
  LOAD_WORKTEAM_ERROR,
  LOAD_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_START,
  CREATE_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_ERROR,
  JOIN_WORKTEAM_START,
  JOIN_WORKTEAM_SUCCESS,
  JOIN_WORKTEAM_ERROR,
  LEAVE_WORKTEAM_START,
  LEAVE_WORKTEAM_SUCCESS,
  LEAVE_WORKTEAM_ERROR,
  UPDATE_WORKTEAM_START,
  UPDATE_WORKTEAM_SUCCESS,
  UPDATE_WORKTEAM_ERROR,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
} from '../constants';
import {
  workTeamList as workTeamListSchema,
  workTeam as workTeamSchema,
  proposalList,
  discussionList,
} from '../store/schema';

const userFields = `
id
thumbnail
name
surname
`;
const requestFields = `
id
processor{
  ${userFields}
}
requester{
  ${userFields}
}
type
content
deniedAt
updatedAt
createdAt
`;

const discussionFields = `
  id
  title
  createdAt
  closedAt
  numComments
  workTeamId
`;

const workTeamFields = `
  id
  displayName
  numMembers
  numDiscussions
  numProposals
  restricted
  mainTeam
  logo
  background
  coordinator{
    name
    surname
    thumbnail
    id
  }`;
const workTeams = `query{
  workTeams {
    ${workTeamFields}
  }}`;

const workTeamsWithMembers = `query{
    workTeams {
      ${workTeamFields}
      members{
        name
        surname
        thumbnail
        id
      }
    }}`;

const memberQuery = `query($id:ID!){
    workTeam(id:$id){
      id
      displayName
      members{
        ${userFields}
      }
    }
    }`;

const wtDetails = `
name
lldName
deName
itName
`;
const proposalFields = `
    id
    title
    state
    body
    workTeamId
    pollOne {${pollFieldsForList}}
    pollTwo {${pollFieldsForList}}`;

const discussionConnection = `discussionConnection(closed:$closed, workteamId:$id){
        pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${discussionFields}
        }
      }
    }`;

const proposalConnection = `proposalConnection(state:$state workTeamId:$id){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${proposalFields}
        }
      }
    }`;

const surveyConnection = `surveyConnection: proposalConnection(state:"survey" workTeamId:$id){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${proposalFields}
        }
      }
    }`;

const workTeamWithDetails = `query($id:ID! $state:String, $closed:Boolean){
    workTeam(id:$id) {
      ${workTeamFields}
      ${wtDetails}
      requestConnection(type:"joinWT" filterBy:[{filter:CONTENT_ID id:$id}]){
        pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${requestFields}
        }
      }
    }
  }
  ${proposalConnection}
  ${discussionConnection}
  ${surveyConnection}

  }`;

const workTeamQuery = `query($id:ID! $state:String, $closed:Boolean){
  workTeam(id:$id){
    ${workTeamFields}
    ownStatus{
      status
      request{
        id
        type
        content
        deniedAt
        }
      }
    }
  ${discussionConnection}
  ${proposalConnection}
  ${surveyConnection}
}`;

const proposalStatusQuery = `query($id:ID! $first:Int){
  workTeam(id:$id){
    id
    linkedProposalConnection(first:$first){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          id
          proposal{
            ${proposalFields}
          }
          state
        }
      }
    }
  }
}`;

const createWorkTeamMutation = `mutation($workTeam:WorkTeamInput){
  createWorkTeam (workTeam:$workTeam){
    ${workTeamFields}
    ${wtDetails}
  }
}`;

const updateWorkTeamMutation = `mutation($workTeam:WorkTeamInput){
  updateWorkTeam (workTeam:$workTeam){
    ${workTeamFields}
    ${wtDetails}
  }
}`;

const joinWorkTeamMutationWithDetails = `mutation($id:ID, $memberId:ID ){
  joinWorkTeam (workTeam:{id:$id, memberId:$memberId}){
    ${workTeamFields}
    ${wtDetails}
    ${discussionConnection}
    ${proposalConnection}
    ${surveyConnection}

      requestConnection(type:"joinWT" filterBy:[{filter:CONTENT_ID id:$id}]){
        pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${requestFields}
        }
      }
    }
  }
}`;

const joinWorkTeamMutation = `mutation($id:ID, $memberId:ID $state:String $closed:Boolean){
  joinWorkTeam (workTeam:{id:$id, memberId:$memberId}){
    ${workTeamFields}
    ownStatus{
      status
      request{
        id
        type
        content
        deniedAt
      }
    }
   ${discussionConnection}
   ${proposalConnection}
   ${surveyConnection}

  }
}`;

const leaveWorkTeamMutation = `mutation($id:ID, $memberId:ID){
  leaveWorkTeam (workTeam:{id:$id, memberId:$memberId}){
    ${workTeamFields}
    ownStatus{
      status
      request{
        id
        type
        content
        deniedAt
      }
    }
  }
}`;

const createResourceAction = (
  actionType,
  resource,
  schema,
  filter,
  pagination,
) => ({
  type: actionType,
  payload: normalize(resource, schema),
  filter,
  pagination,
  savePageInfo: false,
});

const handleResources = (dispatch, data, state, closed) => {
  const depaginated = depaginate(['proposal', 'discussion', 'survey'], data);

  dispatch(
    createResourceAction(
      LOAD_PROPOSAL_LIST_SUCCESS,
      depaginated.proposals,
      proposalList,
      state,
      data.proposalConnection.pageInfo,
    ),
  );
  dispatch(
    createResourceAction(
      LOAD_PROPOSAL_LIST_SUCCESS,
      depaginated.surveys,
      proposalList,
      'survey',
      data.surveyConnection.pageInfo,
    ),
  );
  dispatch(
    createResourceAction(
      LOAD_DISCUSSIONS_SUCCESS,
      depaginated.discussions,
      discussionList,
      closed ? 'closed' : 'active',
      data.discussionConnection.pageInfo,
    ),
  );
};

export function loadWorkTeams(withMembers) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAMS_START,
    });

    try {
      const { data } = await graphqlRequest(
        withMembers ? workTeamsWithMembers : workTeams,
      );
      const normalizedData = normalize(data.workTeams, workTeamListSchema);

      dispatch({ type: LOAD_WORKTEAMS_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_WORKTEAMS_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function createWorkTeam(workTeam) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_WORKTEAM_START,
      id: 'create',
    });

    try {
      const { data } = await graphqlRequest(createWorkTeamMutation, {
        workTeam,
      });
      const normalizedData = normalize(data.createWorkTeam, workTeamSchema);

      dispatch({
        type: CREATE_WORKTEAM_SUCCESS,
        id: 'create',
        payload: normalizedData,
      });
    } catch (e) {
      dispatch({
        type: CREATE_WORKTEAM_ERROR,
        id: 'create',
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function joinWorkTeam(workTeamData, details) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const state = 'active';
    const closed = false;
    dispatch({
      type: JOIN_WORKTEAM_START,
    });

    try {
      const query = details
        ? joinWorkTeamMutationWithDetails
        : joinWorkTeamMutation;

      const { data } = await graphqlRequest(query, {
        ...workTeamData,
        state,
        closed,
      });

      // connections are "inline"

      const normalizedData = normalize(
        depaginate(['request'], data.joinWorkTeam),
        workTeamSchema,
      );

      dispatch({ type: JOIN_WORKTEAM_SUCCESS });
      dispatch({ type: LOAD_WORKTEAM_SUCCESS, payload: normalizedData });

      // dispatch multiple

      handleResources(dispatch, data.joinWorkTeam, state, closed);
    } catch (e) {
      dispatch({
        type: JOIN_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function leaveWorkTeam(workTeamData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LEAVE_WORKTEAM_START,
    });

    try {
      const { data } = await graphqlRequest(
        leaveWorkTeamMutation,
        workTeamData,
      );
      const normalizedData = normalize(data.leaveWorkTeam, workTeamSchema);

      dispatch({ type: LEAVE_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LEAVE_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function loadWorkTeam(
  { id, closed = false, state = 'active' },
  details,
) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAM_START,
    });
    const query = details ? workTeamWithDetails : workTeamQuery;
    try {
      const { data } = await graphqlRequest(query, { id, closed, state });

      // page query
      handleResources(dispatch, data, state, closed);

      dispatch({
        type: LOAD_WORKTEAM_SUCCESS,
        payload: normalize(
          depaginate(['request'], data.workTeam),
          workTeamSchema,
        ),
        filter: closed ? 'closed' : 'active',
      });
    } catch (e) {
      dispatch({
        type: LOAD_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function loadWorkTeamMembers({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAM_START,
    });
    try {
      const { data } = await graphqlRequest(memberQuery, { id });

      // TODO make paginable
      const normalizedData = normalize(data.workTeam, workTeamSchema);

      dispatch({ type: LOAD_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function loadProposalStatus({ id, first }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAM_START,
    });
    try {
      const { data } = await graphqlRequest(proposalStatusQuery, { id, first });
      const proposals = data.workTeam.linkedProposalConnection.edges.map(
        p => p.node,
      );
      const allData = { id: data.workTeam.id, linkedProposals: proposals };
      const normalizedData = normalize(allData, workTeamSchema);

      dispatch({ type: LOAD_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function updateWorkTeam(workTeam) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_WORKTEAM_START,
    });

    try {
      const { data } = await graphqlRequest(updateWorkTeamMutation, {
        workTeam,
      });
      const normalizedData = normalize(data.updateWorkTeam, workTeamSchema);

      dispatch({ type: UPDATE_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: UPDATE_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}
