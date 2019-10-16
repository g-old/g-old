/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  LOAD_COMMENT_VOTES_START,
  LOAD_COMMENT_VOTES_SUCCESS,
  LOAD_COMMENT_VOTES_ERROR,
  UPDATE_COMMENT_START,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_ERROR,
} from '../constants';
import { createMutation } from './utils';
import { commentFields } from './comment';
import {
  //commentVote as commentVoteSchema,
  comment as commentSchema,
  commentVoteList as commentVoteListSchema,
} from '../store/schema';

const commentVoteFields = `
id
position
commentId
`;

const createCommentVoteMutation = `
  mutation ($commentVote:CommentVoteInput) {
    createCommentVote (commentVote:$commentVote){
      ${commentFields}
    }
  }
`;

const updateCommentVoteMutation = `
  mutation ($commentVote:CommentVoteInput) {
    updateCommentVote (commentVote:$commentVote){
      ${commentFields}
    }
  }
`;

const deleteCommentVoteMutation = `
  mutation ($commentVote:CommentVoteInput) {
    deleteCommentVote (commentVote:$commentVote){
      ${commentFields}
    }
  }
`;

const commentVoteConnection = `
query ($first:Int $after:String) {
  commentVoteConnection (first:$first after:$after) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
    ${commentVoteFields}
      }
    }
  }
}
`;

export const createCommentVote = createMutation(
  [UPDATE_COMMENT_START, UPDATE_COMMENT_SUCCESS, UPDATE_COMMENT_ERROR],
  'commentVote',
  createCommentVoteMutation,
  commentSchema,
  data => data.createCommentVote,
  args => ({
    id: args.commentId,
  }),
);

export const updateCommentVote = createMutation(
  [UPDATE_COMMENT_START, UPDATE_COMMENT_SUCCESS, UPDATE_COMMENT_ERROR],
  'commentVote',
  updateCommentVoteMutation,
  commentSchema,
  data => data.updateCommentVote,
  args => ({
    id: args.commentId,
  }),
);

export const deleteCommentVote = createMutation(
  [UPDATE_COMMENT_START, UPDATE_COMMENT_SUCCESS, UPDATE_COMMENT_ERROR],
  'commentVote',
  deleteCommentVoteMutation,
  commentSchema,
  data => data.deleteCommentVote,
  args => ({
    id: args.commentId,
  }),
);

export function loadCommentVoteList({ first, after }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_COMMENT_VOTES_START,
    });

    try {
      const { data } = await graphqlRequest(commentVoteConnection, {
        first,
        after,
      });
      const commentVotes = data.commentVoteConnection.edges.map(u => u.node);
      const normalizedData = normalize(commentVotes, commentVoteListSchema);
      dispatch({
        type: LOAD_COMMENT_VOTES_SUCCESS,
        payload: normalizedData,
        pagination: data.commentVoteConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_COMMENT_VOTES_ERROR,
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
