/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_DISCUSSION_START,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSION_ERROR,
  CREATE_DISCUSSION_START,
  CREATE_DISCUSSION_SUCCESS,
  CREATE_DISCUSSION_ERROR,
} from '../constants';
import {
  discussion as discussionSchema,
  //  discussionList as discussionListSchema,
  //  tagArray as tagArraySchema,
} from '../store/schema';
import { getIsDiscussionFetching } from '../reducers';

const discussionFields = `
id
createdAt
title
numComments`;

const authorFields = `
id
name
surname
thumbnail
        `;
/* const discussionConnection = `query($first:Int, $after:String, $workTeamId:ID){
  discussionConnection(first:$first after:$after, workTeamId:$workTeamId){
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
        ${discussionFields}
      }
    }
  }
}`; */

const discussionFragment = `
${discussionFields}
  content
  author{
    ${authorFields}
  }
  comments{
    id
    content
    numReplies
    parentId
    createdAt
    author{
      ${authorFields}
    }
  }`;
const discussionQuery = `query($id:ID){
  discussion(id:$id){
  ${discussionFragment}
  }
}`;

const createDiscussionMutation = `mutation($workTeamId:ID $content:String $title:String){
  createDiscussion(discussion:{workTeamId:$workTeamId content:$content title:$title}){
    ${discussionFragment}
  }
}`;

export function loadDiscussion({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // Dont fetch if pending
    const state = await getState();
    if (process.env.BROWSER) {
      if (id && getIsDiscussionFetching(state, id)) {
        return false;
      }
    }

    dispatch({
      type: LOAD_DISCUSSION_START,
      id,
    });

    try {
      const { data } = await graphqlRequest(discussionQuery, { id });
      const normalizedData = normalize(data.discussion, discussionSchema);
      dispatch({
        type: LOAD_DISCUSSION_SUCCESS,
        payload: normalizedData,
        id,
      });
      return data.discussion.id;
    } catch (error) {
      dispatch({
        type: LOAD_DISCUSSION_ERROR,
        payload: {
          error,
        },
        id,
      });
      return false;
    }
  };
}

export function createDiscussion(discussion) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    dispatch({
      type: CREATE_DISCUSSION_START,
      id: virtualId,
    });
    try {
      const { data } = await graphqlRequest(
        createDiscussionMutation,
        discussion,
      );
      const normalizedData = normalize(data.createDiscussion, discussionSchema);
      // TODO change filter structure of reducer

      dispatch({
        type: CREATE_DISCUSSION_SUCCESS,
        payload: normalizedData,
        id: virtualId,
      });
    } catch (error) {
      dispatch({
        type: CREATE_DISCUSSION_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
      });
      return false;
    }

    return true;
  };
}
