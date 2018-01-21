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
requests{
${requestFields}
}
`;
const workTeamWithDetails = `query($id:ID!){
    workTeam(id:$id) {
      ${workTeamFields}
      ${wtDetails}
    }}`;

const proposalFields = `
    id
    title
    state
    body
    tags{
      displayName
      id
      count
    }
    pollOne ${pollFieldsForList}
    pollTwo ${pollFieldsForList}`;

const workTeamQuery = `query($id:ID!){
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
    proposals{
      ${proposalFields}
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
  }
}`;

const joinWorkTeamMutation = `mutation($id:ID, $memberId:ID){
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
    proposals{
      ${proposalFields}
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
        workTeamData,
      );
      const normalizedData = normalize(data.joinWorkTeam, workTeamSchema);

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

export function loadWorkTeam({ id }, details) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_WORKTEAM_START,
    });
    const query = details ? workTeamWithDetails : workTeamQuery;
    try {
      const { data } = await graphqlRequest(query, { id });
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
