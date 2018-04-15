/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { pollFieldsForList } from './proposal';
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
} from '../constants';
import {
  workTeamList as workTeamListSchema,
  workTeam as workTeamSchema,
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
    pollOne {${pollFieldsForList}}
    pollTwo {${pollFieldsForList}}`;

const workTeamWithDetails = `query($id:ID!){
    workTeam(id:$id) {
      ${workTeamFields}
      ${wtDetails}
          proposalConnection(state:"active" workTeamId:$id){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${proposalFields}
        }
      }
    }
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

    }}`;

const workTeamQuery = `query($id:ID! $state:String){
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
    discussions{
      id
      title
      createdAt
      numComments
    }
    proposalConnection(state:$state workTeamId:$id){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${proposalFields}
        }
      }
    }
  }
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

const joinWorkTeamMutationWithDetails = `mutation($id:ID, $memberId:ID){
  joinWorkTeam (workTeam:{id:$id, memberId:$memberId}){
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
}`;

const joinWorkTeamMutation = `mutation($id:ID, $memberId:ID $state:String){
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
    discussions{
      id
      title
      createdAt
      numComments
    }
    proposalConnection(state:$state workTeamId:$id){
      pageInfo{
        endCursor
        hasNextPage
      }
      edges{
        node{
          ${proposalFields}
        }
      }
    }
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

const dePaginate = (data, resourceName) => {
  let resources = [];
  const connectionName = `${resourceName}Connection`;
  if (data[connectionName]) {
    resources = data[connectionName].edges.map(p => p.node);
    data[`${resourceName}s`] = resources; // eslint-disable-line no-param-reassign
  }
  return data;
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
    dispatch({
      type: JOIN_WORKTEAM_START,
    });

    try {
      const { data } = await graphqlRequest(
        details ? joinWorkTeamMutationWithDetails : joinWorkTeamMutation,
        { ...workTeamData, state: 'active' },
      );
      // TODO make paginable
      let proposals = [];
      if (data.joinWorkTeam.proposalConnection) {
        proposals = data.joinWorkTeam.proposalConnection.edges.map(p => p.node);
      }
      data.joinWorkTeam.proposals = proposals;
      const normalizedData = normalize(
        dePaginate(data.joinWorkTeam, 'request'),
        workTeamSchema,
      );

      dispatch({ type: JOIN_WORKTEAM_SUCCESS, payload: normalizedData });
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

export function loadWorkTeam({ id, state = 'active' }, details) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAM_START,
    });
    const query = details ? workTeamWithDetails : workTeamQuery;
    try {
      const { data } = await graphqlRequest(query, { id, state });

      // TODO make paginable
      let proposals = [];
      if (data.workTeam.proposalConnection) {
        proposals = data.workTeam.proposalConnection.edges.map(p => p.node);
      }
      data.workTeam.proposals = proposals;
      // TODO make paginable
      let requests = [];
      if (data.workTeam.requestConnection) {
        requests = data.workTeam.requestConnection.edges.map(p => p.node);
      }
      data.workTeam.requests = requests;
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
