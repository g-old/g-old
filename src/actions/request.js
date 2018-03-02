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
  LOAD_REQUESTS_START,
  LOAD_REQUESTS_SUCCESS,
  LOAD_REQUESTS_ERROR,
} from '../constants';
import {
  request as requestSchema,
  requestList as requestListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const userFields = `
id
thumbnail
name
surname
`;
export const requestFields = `
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

const createRequestMutation = `
  mutation ($request:RequestInput) {
    createRequest (request:$request){
      result{
        ${requestFields}
      }
      errors
    }
  }
`;

const updateRequestMutation = `
  mutation ($request:RequestInput) {
    updateRequest (request:$request){
      ${requestFields}
    }
  }
`;

const deleteRequestMutation = `
  mutation ($request:RequestInput) {
    deleteRequest (request:$request){
      ${requestFields}
    }
  }
`;

const requestConnection = `
query ($first:Int $after:String $type:String $filter:[FilterInput]) {
  requestConnection (first:$first after:$after type:$type filterBy:$filter ) {
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
    const virtualId = '0000';
    const properties = genStatusIndicators(['createRequest']);
    dispatch({
      type: CREATE_REQUEST_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createRequestMutation, { request });
      if (data.createRequest.errors) {
        dispatch({
          type: CREATE_REQUEST_ERROR,
          payload: {
            error: data.createRequest.errors,
          },
          message: data.createRequest.errors[0] || 'Something went wrong',
          id: virtualId,
          request,
          properties,
        });
      } else {
        const normalizedData = normalize(
          data.createRequest.result,
          requestSchema,
        );
        dispatch({
          type: CREATE_REQUEST_SUCCESS,
          payload: normalizedData,
          id: virtualId,
          properties,
          request,
        });
      }
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
      const { data } = await graphqlRequest(updateRequestMutation, { request });
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
      const { data } = await graphqlRequest(deleteRequestMutation, { request });
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

export function loadRequestList({
  first,
  after,
  type,
  contentId,
  requesterId,
}) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_REQUESTS_START,
    });

    try {
      const filter = [];
      if (contentId) {
        filter.push({ filter: 'CONTENT_ID', id: contentId });
      }
      if (requesterId) {
        filter.push({
          filter: 'REQUESTER_ID',
          id: requesterId,
        });
      }
      const { data } = await graphqlRequest(requestConnection, {
        first,
        after,
        type,
        filter,
      });
      const requests = data.requestConnection.edges.map(u => u.node);
      const normalizedData = normalize(requests, requestListSchema);
      dispatch({
        type: LOAD_REQUESTS_SUCCESS,
        payload: normalizedData,
        pagination: data.requestConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_REQUESTS_ERROR,
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
