/* eslint-disable import/prefer-default-export */

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

export function createLike({ statementId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_LIKE_START,
      payload: {
        statementId,
      },
    });

    try {
      const { data } = await graphqlRequest(createStatementLike, { id: statementId });
      dispatch({
        type: CREATE_LIKE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_LIKE_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function deleteLike({ statementId, likeId }) {
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
      dispatch({
        type: DELETE_LIKE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: DELETE_LIKE_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
