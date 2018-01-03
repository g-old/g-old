/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_REQUEST_START,
  CREATE_REQUEST_SUCCESS,
  CREATE_REQUEST_ERROR,
  UPDATE_REQUEST_START,
  UPDATE_REQUEST_SUCCESS,
  UPDATE_REQUEST_ERROR,
  DELETE_REQUEST_START,
  DELETE_REQUEST_SUCCESS,
  DELETE_REQUEST_ERROR,
  LOAD_REQUEST_START,
  LOAD_REQUEST_SUCCESS,
  LOAD_REQUEST_ERROR,
} from '../constants';
import {
  request as requestSchema,
  requestList as requestListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const requestFields = `
id
`;

const createRequestMutation = `
  mutation ($request:requestInput) {
    createRequest (request:$request){
      ${requestFields}
    }
  }
`;

const updateRequestMutation = `
  mutation ($request:requestInput) {
    updateRequest (request:$request){
      ${requestFields}
    }
  }
`;

const deleteRequestMutation = `
  mutation ($request:requestInput) {
    deleteRequest (request:$request){
      ${requestFields}
    }
  }
`;

const requestConnection = `
query ($first:Number $after:String) {
  requestConnection (first:$first after:$after) {
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
`;

export function createRequest(request) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = request.parentId || '0000';
    const properties = genStatusIndicators(['createRequest']);
    dispatch({
      type: CREATE_REQUEST_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createRequestMutation, request);
      const normalizedData = normalize(data.createRequest, requestSchema);
      dispatch({
        type: CREATE_REQUEST_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
        request,
      });
    } catch (error) {
      dispatch({
        type: CREATE_REQUEST_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        request,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updateRequest(request) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updaterequest']);
    dispatch({
      type: UPDATE_REQUEST_START,
      id: request.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateRequestMutation, request);
      const normalizedData = normalize(data.updateRequest, requestSchema);
      dispatch({
        type: UPDATE_REQUEST_SUCCESS,
        payload: normalizedData,
        properties,
        id: request.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_REQUEST_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: request.id,
        request,
      });
      return false;
    }

    return true;
  };
}

export function deleteRequest(request) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteRequest']);
    dispatch({
      type: DELETE_REQUEST_START,
      id: request.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteRequestMutation, request);
      const normalizedData = normalize(data.deleteRequest, requestSchema);
      dispatch({
        type: DELETE_REQUEST_SUCCESS,
        payload: normalizedData,
        properties,
        id: request.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_REQUEST_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: request.id,
        properties,
        request: { delete: true },
      });
      return false;
    }

    return true;
  };
}

export function loadRequestList({ first, after }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_REQUEST_START,
    });

    try {
      const { data } = await graphqlRequest(requestConnection, {
        first,
        after,
      });
      const requests = data.requestConnection.edges.map(u => u.node);
      const normalizedData = normalize(requests, requestListSchema);
      dispatch({
        type: LOAD_REQUEST_SUCCESS,
        payload: normalizedData,
        pagination: data.requestConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_REQUEST_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
