/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

import { statementLike as statementLikeSchema } from '../store/schema';
import {
  CREATE_LIKE_START,
  CREATE_LIKE_SUCCESS,
  CREATE_LIKE_ERROR,
  DELETE_LIKE_START,
  DELETE_LIKE_SUCCESS,
  DELETE_LIKE_ERROR,
} from '../constants';

const createStatementLike = `
  mutation ($id:ID!) {
    createStatementLike (like:{statementId: $id}){
      id
      statementId
    }
  }
`;
const deleteStatementLike = `
  mutation ($sId:ID! $id:ID) {
    deleteStatementLike (like:{statementId: $sId id: $id}){
      id
      statementId
    }
  }
`;

export function createLike({ statementId, pollId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_LIKE_START,
    });

    try {
      const { data } = await graphqlRequest(createStatementLike, { id: statementId });
      const normalizedData = normalize(data.createStatementLike, statementLikeSchema);
      dispatch({
        type: CREATE_LIKE_SUCCESS,
        payload: normalizedData,
        pollId,
      });
    } catch (error) {
      dispatch({
        type: CREATE_LIKE_ERROR,
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

export function deleteLike({ statementId, likeId, pollId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: DELETE_LIKE_START,
      payload: {
        statementId,
        id: likeId,
      },
    });

    try {
      const { data } = await graphqlRequest(deleteStatementLike, { sId: statementId, id: likeId });
      const normalizedData = normalize(data.deleteStatementLike, statementLikeSchema);
      dispatch({
        type: DELETE_LIKE_SUCCESS,
        payload: normalizedData,
        pollId,
      });
    } catch (error) {
      dispatch({
        type: DELETE_LIKE_ERROR,
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
