/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  LOAD_REPLIES_START,
  LOAD_REPLIES_SUCCESS,
  LOAD_REPLIES_ERROR,
  CREATE_COMMENT_START,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_ERROR,
} from '../constants';
import {
  comment as commentSchema,
  commentList as commentListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const commentFields = `
id
parentId
content
numReplies
discussionId
createdAt
author{
  id
  name
  surname
  thumbnail
}
`;

const createCommentMutation = `
  mutation ($content:String $discussionId:ID $parentId:ID) {
    createComment (comment:{ content:$content discussionId:$discussionId parentId:$parentId}){
      ${commentFields}
    }
  }
`;

const commentsQuery = `
query($parentId:ID){
  comments(parentId:$parentId){
    ${commentFields}
  }
}
`;

export function createComment(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    const properties = genStatusIndicators(['createCom']);
    dispatch({
      type: CREATE_COMMENT_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createCommentMutation, comment);
      const normalizedData = normalize(data.createComment, commentSchema);
      dispatch({
        type: CREATE_COMMENT_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
      });
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

// TODO rename in Replies, add ispending check
export function loadComments(comment) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_REPLIES_START,
    });
    try {
      const { data } = await graphqlRequest(commentsQuery, comment);
      const normalizedData = normalize(data.comments, commentListSchema);
      dispatch({
        type: LOAD_REPLIES_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_REPLIES_ERROR,
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
