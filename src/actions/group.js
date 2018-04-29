/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { pollFieldsForList } from './proposal';
import {
  LOAD_GROUPS_START,
  LOAD_GROUPS_ERROR,
  LOAD_GROUPS_SUCCESS,
  LOAD_GROUP_START,
  LOAD_GROUP_ERROR,
  LOAD_GROUP_SUCCESS,
  CREATE_GROUP_START,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP_ERROR,
  JOIN_GROUP_START,
  JOIN_GROUP_SUCCESS,
  JOIN_GROUP_ERROR,
  LEAVE_GROUP_START,
  LEAVE_GROUP_SUCCESS,
  LEAVE_GROUP_ERROR,
  UPDATE_GROUP_START,
  UPDATE_GROUP_SUCCESS,
  UPDATE_GROUP_ERROR,
} from '../constants';
import {
  groupList as groupListSchema,
  group as groupSchema,
} from '../store/schema';

const pollingModeFields = `
    id
    withStatements
    unipolar
    thresholdRef
    displayName
    names,
    inheritable
`;

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

const groupFields = `
  id
  displayName
  numMembers
  numDiscussions
  numProposals
  restricted
  mainTeam
  picture
  cover
  coordinator{
    name
    surname
    thumbnail
    id
  }`;
const groups = `query{
  groups {
    ${groupFields}
  }}`;

const groupsWithMembers = `query{
    groups {
      ${groupFields}
      members{
        name
        surname
        thumbnail
        id
      }
    }}`;

const wtDetails = `
names
`;
const groupWithDetails = `query($id:ID!){
    group(id:$id) {
      ${groupFields}
      ${wtDetails}
      subGroups{
        ${groupFields}
      }
      parentGroup{
        ${groupFields}
            subGroups{
        ${groupFields}
        }
      }
      pollingModes{
        ${pollingModeFields}
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

const proposalFields = `
    id
    title
    state
    body
    pollOne ${pollFieldsForList}
    pollTwo ${pollFieldsForList}`;

const memberQuery = `query($id:ID!){
    workTeam(id:$id){
      id
      displayName
      members{
        ${userFields}
      }
    }
    }`;

const groupQuery = `query($id:ID! $state:String){
  group(id:$id){
    ${groupFields}
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
    proposalConnection(state:$state groupId:$id){
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

const proposalStatusQuery = `query($id:ID!){
  group(id:$id){
    id
    linkedProposalConnection{
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

const createGroupMutation = `mutation($group:GroupInput){
  createGroup (group:$group){
    ${groupFields}
    ${wtDetails}
  }
}`;

const updateGroupMutation = `mutation($group:GroupInput){
  updateGroup (group:$group){
    ${groupFields}
    ${wtDetails}
  }
}`;

const joinGroupMutationWithDetails = `mutation($id:ID, $memberId:ID){
  joinGroup (group:{id:$id, memberId:$memberId}){
    ${groupFields}
    ${wtDetails}
  }
}`;

const joinGroupMutation = `mutation($id:ID, $memberId:ID $state:String){
  joinGroup (group:{id:$id, memberId:$memberId}){
    ${groupFields}
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
    proposalConnection(state:$state groupId:$id){
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

const leaveGroupMutation = `mutation($id:ID, $memberId:ID){
  leaveGroup (group:{id:$id, memberId:$memberId}){
    ${groupFields}
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

export function loadGroups(withMembers) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_GROUPS_START,
    });

    try {
      const { data } = await graphqlRequest(
        withMembers ? groupsWithMembers : groups,
      );
      const normalizedData = normalize(data.groups, groupListSchema);

      dispatch({ type: LOAD_GROUPS_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_GROUPS_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function createGroup(group) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_GROUP_START,
      id: 'create',
    });

    try {
      const { data } = await graphqlRequest(createGroupMutation, {
        group,
      });
      const normalizedData = normalize(data.createGroup, groupSchema);

      dispatch({
        type: CREATE_GROUP_SUCCESS,
        id: 'create',
        payload: normalizedData,
      });
    } catch (e) {
      dispatch({
        type: CREATE_GROUP_ERROR,
        id: 'create',
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function joinGroup(groupData, details) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: JOIN_GROUP_START,
    });

    try {
      const { data } = await graphqlRequest(
        details ? joinGroupMutationWithDetails : joinGroupMutation,
        { ...groupData, state: 'active' },
      );
      // TODO make paginable
      let proposals = [];
      if (data.joinGroup.proposalConnection) {
        proposals = data.joinGroup.proposalConnection.edges.map(p => p.node);
      }
      data.joinGroup.proposals = proposals;
      const normalizedData = normalize(data.joinGroup, groupSchema);

      dispatch({ type: JOIN_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: JOIN_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function leaveGroup(groupData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LEAVE_GROUP_START,
    });

    try {
      const { data } = await graphqlRequest(leaveGroupMutation, groupData);
      const normalizedData = normalize(data.leaveGroup, groupSchema);

      dispatch({ type: LEAVE_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LEAVE_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function loadGroup({ id, state = 'active' }, details) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_GROUP_START,
    });
    const query = details ? groupWithDetails : groupQuery;
    try {
      const { data } = await graphqlRequest(query, { id, state });

      // TODO make paginable
      let proposals = [];
      if (data.group.proposalConnection) {
        proposals = data.group.proposalConnection.edges.map(p => p.node);
      }
      data.group.proposals = proposals;
      // TODO make paginable
      let requests = [];
      if (data.group.requestConnection) {
        requests = data.group.requestConnection.edges.map(p => p.node);
      }
      data.group.requests = requests;
      const normalizedData = normalize(data.group, groupSchema);

      dispatch({ type: LOAD_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}
export function loadProposalStatus({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_GROUP_START,
    });
    try {
      const { data } = await graphqlRequest(proposalStatusQuery, { id });
      const proposals = data.group.linkedProposalConnection.edges.map(
        p => p.node,
      );
      const allData = { id: data.group.id, linkedProposals: proposals };
      const normalizedData = normalize(allData, groupSchema);

      dispatch({ type: LOAD_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function updateGroup(group) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_GROUP_START,
    });

    try {
      const { data } = await graphqlRequest(updateGroupMutation, {
        group,
      });
      const normalizedData = normalize(data.updateGroup, groupSchema);

      dispatch({ type: UPDATE_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: UPDATE_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}

export function loadGroupMembers({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_GROUP_START,
    });
    try {
      const { data } = await graphqlRequest(memberQuery, { id });

      // TODO make paginable
      const normalizedData = normalize(data.group, groupSchema);

      dispatch({ type: LOAD_GROUP_SUCCESS, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: LOAD_GROUP_ERROR,
        message: e.message || 'Something went wrong',
      });
    }
  };
}
