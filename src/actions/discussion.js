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
numComments
closedAt
`;

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
    editedAt
    author{
      ${authorFields}
    }
  }`;
const discussionQuery = `query($id:ID $parentId:ID){
  discussion(id:$id parentId:$parentId){
  ${discussionFragment}
  subscription{
    id
    subscriptionType
  }
  }
}`;

const createDiscussionMutation = `mutation($workTeamId:ID $content:String $title:String){
  createDiscussion(discussion:{workTeamId:$workTeamId content:$content title:$title}){
    ${discussionFragment}
  }
}`;

const mergeRepliesInotParent = (parentId, comments) => {
  const replies = comments
    .filter(c => c.parentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const parentIds = comments.reduce((acc, curr) => {
    if (curr.id !== parentId) {
      if (!curr.parentId) {
        acc[curr.id] = curr.id;
      }
    }
    return acc;
  }, {});

  return comments.reduce((acc, curr) => {
    if (curr.id in parentIds) {
      acc.push(curr);
    } else if (curr.id === parentId) {
      curr.replies = replies; // eslint-disable-line
      acc.push(curr);
    }
    return acc;
  }, []);
};
export function loadDiscussion({ id, parentId }) {
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
      const { data } = await graphqlRequest(discussionQuery, { id, parentId });
      if (parentId) {
        data.discussion.comments = mergeRepliesInotParent(
          parentId,
          data.discussion.comments,
        );
      }
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
        info: `${normalizedData.result}`,
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
