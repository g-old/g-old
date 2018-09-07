/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  LOAD_REPLIES_START,
  LOAD_REPLIES_SUCCESS,
  LOAD_REPLIES_ERROR,
  CREATE_COMMENT_START,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_ERROR,
  UPDATE_COMMENT_START,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_ERROR,
  DELETE_COMMENT_START,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_ERROR,
  CREATE_SUBSCRIPTION_SUCCESS,
  SCROLL_TO_RESOURCE,
} from '../constants';
import {
  subscription as subscriptionSchema,
  comment as commentSchema,
  commentList as commentListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';
import { subscriptionFields } from './subscription';

export const commentFields = `
id
parentId
content
numReplies
discussionId
createdAt
editedAt
author{
  id
  name
  surname
  thumbnail
}
`;

const resultFields = `
  subscription{
    ${subscriptionFields}
  }
  resource{
    ${commentFields}
  }
`;

const createCommentMutation = `
  mutation ($content:String $discussionId:ID $parentId:ID, $targetId:ID) {
    createComment (comment:{ content:$content discussionId:$discussionId parentId:$parentId} targetId:$targetId){
      ${resultFields}
    }
  }
`;

const updateCommentMutation = `
  mutation ($content:String $id:ID) {
    updateComment (comment:{ content:$content id:$id}){
      ${commentFields}
    }
  }
`;

const deleteCommentMutation = `
  mutation ($id:ID) {
    deleteComment (comment:{ id:$id}){
      ${commentFields}
    }
  }
`;

const commentsQuery = `
query($parentId:ID!){
  comments(parentId:$parentId){
    ${commentFields}
  }
}
`;

export function createComment(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = comment.parentId || '0000';
    const properties = genStatusIndicators(['createCom']);

    dispatch({
      type: CREATE_COMMENT_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createCommentMutation, comment);
      const { resource, subscription } = data.createComment;
      const normalizedComment = normalize(resource, commentSchema);

      dispatch({
        type: CREATE_COMMENT_SUCCESS,
        payload: normalizedComment,
        id: virtualId,
        properties,
        comment,
      });

      if (subscription) {
        const normalizedSubscription = normalize(
          subscription,
          subscriptionSchema,
        );
        dispatch({
          type: CREATE_SUBSCRIPTION_SUCCESS,
          payload: normalizedSubscription,
        });
      }
    } catch (error) {
      dispatch({
        type: CREATE_COMMENT_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        comment,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updateComment(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updateCom']);
    dispatch({
      type: UPDATE_COMMENT_START,
      id: comment.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateCommentMutation, comment);
      const normalizedData = normalize(data.updateComment, commentSchema);
      dispatch({
        type: UPDATE_COMMENT_SUCCESS,
        payload: normalizedData,
        properties,
        id: comment.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_COMMENT_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: comment.id,
        comment,
      });
      return false;
    }

    return true;
  };
}

export function deleteComment(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteCom']);
    dispatch({
      type: DELETE_COMMENT_START,
      id: comment.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteCommentMutation, comment);
      const normalizedData = normalize(data.deleteComment, commentSchema);
      dispatch({
        type: DELETE_COMMENT_SUCCESS,
        payload: normalizedData,
        properties,
        id: comment.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_COMMENT_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: comment.id,
        properties,
        comment: { delete: true },
      });
      return false;
    }

    return true;
  };
}

// TODO rename in Replies, add ispending check
export function loadComments(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteCom']);

    dispatch({
      type: LOAD_REPLIES_START,
      properties,
      id: comment.parentId,
    });
    try {
      const { data } = await graphqlRequest(commentsQuery, comment);
      const normalizedData = normalize(data.comments, commentListSchema);
      dispatch({
        type: LOAD_REPLIES_SUCCESS,
        payload: normalizedData,
        properties,
        id: comment.parentId,
      });
    } catch (error) {
      dispatch({
        type: LOAD_REPLIES_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        properties,
        id: comment.parentId,
      });
      return false;
    }

    return true;
  };
}

export function scrollToResource({ id, childId, type, containerId }) {
  return async dispatch => {
    dispatch({
      type: SCROLL_TO_RESOURCE,
      payload: { id, childId, type, containerId },
    });

    return true;
  };
}
