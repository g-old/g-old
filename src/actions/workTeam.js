/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_WORKTEAMS_START,
  LOAD_WORKTEAMS_ERROR,
  LOAD_WORKTEAMS_SUCCESS,
  CREATE_WORKTEAM_START,
  CREATE_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_ERROR,
  JOIN_WORKTEAM_START,
  JOIN_WORKTEAM_SUCCESS,
  JOIN_WORKTEAM_ERROR,
  LEAVE_WORKTEAM_START,
  LEAVE_WORKTEAM_SUCCESS,
  LEAVE_WORKTEAM_ERROR,
} from '../constants';
import {
  workTeamList as workTeamListSchema,
  workTeam as workTeamSchema,
  user as userSchema,
} from '../store/schema';

const workTeam = `
  id
  name
  coordinator{
    name
    surname
    thumbnail
    id
  }`;
const workTeams = `query{
  workTeams {
    ${workTeam}
  }}`;

const workTeamsWithMembers = `query{
    workTeams {
      ${workTeam}
      members{
        name
        surname
        thumbnail
        id
      }
    }}`;

const createWorkTeamMutation = `mutation($name:String, $coordinatorId:ID){
  createWorkTeam (workTeam:{name:$name, coordinatorId:$coordinatorId}){
    ${workTeam}
  }
}`;

const joinWorkTeamMutation = `mutation($id:ID, $memberId:ID){
  joinWorkTeam (workTeam:{id:$id, memberId:$memberId}){
    id
    workTeams{
      ${workTeam}
    }
  }
}`;

const leaveWorkTeamMutation = `mutation($id:ID, $memberId:ID){
  leaveWorkTeam (workTeam:{id:$id, memberId:$memberId}){
    id
    workTeams{
      ${workTeam}
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

export function createWorkTeam(workTeamData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_WORKTEAM_START,
    });

    try {
      const { data } = await graphqlRequest(
        createWorkTeamMutation,
        workTeamData,
      );
      const normalizedData = normalize(data.createWorkTeam, workTeamSchema);

      dispatch({ type: CREATE_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: CREATE_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function joinWorkTeam(workTeamData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: JOIN_WORKTEAM_START,
    });

    try {
      const { data } = await graphqlRequest(joinWorkTeamMutation, workTeamData);
      const normalizedData = normalize(data.joinWorkTeam, userSchema);

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
      const normalizedData = normalize(data.leaveWorkTeam, userSchema);

      dispatch({ type: LEAVE_WORKTEAM_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LEAVE_WORKTEAM_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}
