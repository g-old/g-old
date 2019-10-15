/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_DISCUSSION_START,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSION_ERROR,
  LOAD_DISCUSSIONS_START,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_DISCUSSIONS_ERROR,
  CREATE_DISCUSSION_START,
  CREATE_DISCUSSION_SUCCESS,
  CREATE_DISCUSSION_ERROR,
  UPDATE_DISCUSSION_START,
  UPDATE_DISCUSSION_SUCCESS,
  UPDATE_DISCUSSION_ERROR,
} from '../constants';
import {
  discussion as discussionSchema,
  discussionList as discussionListSchema,
  //  tagArray as tagArraySchema,
} from '../store/schema';
import { getIsDiscussionFetching, getDiscussionUpdates } from '../reducers';
import { userFields } from './user';
import { commentFields } from './comment';

export const discussionFields = `
  id
  title
  createdAt
  closedAt
  deletedAt
  updatedAt
  numComments
  workTeamId
  content
  author{
    ${userFields}
  }
`;

const discussionConnection = `query($first:Int, $after:String, $workteamId:ID $closed:Boolean){
  discussionConnection(first:$first after:$after, workteamId:$workteamId closed:$closed){
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
}`;

const discussionFragment = `
${discussionFields}

  workTeam{
    id
    displayName
    logo
    coordinatorId
  }
  comments{
    ${commentFields}
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
const updateDiscussionMutation = `mutation($discussion: DiscussionInput){
  updateDiscussion(discussion:$discussion){
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

export function loadDiscussions({ first, after, closed, workteamId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO check if pending
    dispatch({ type: LOAD_DISCUSSIONS_START });
    try {
      const { data } = await graphqlRequest(discussionConnection, {
        closed,
        workteamId,
        first,
        after,
      });
      const discussions = data.discussionConnection.edges.map(p => p.node);
      const normalizedData = normalize(discussions, discussionListSchema);

      dispatch({
        type: LOAD_DISCUSSIONS_SUCCESS,
        payload: normalizedData,
        filter: closed ? 'closed' : 'active',
        pagination: data.discussionConnection.pageInfo,
        savePageInfo: after != null,
      });
      return true;
    } catch (error) {
      dispatch({
        type: LOAD_DISCUSSIONS_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }
  };
}

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
    if (process.env.BROWSER) {
      const state = getState();
      const updates = getDiscussionUpdates(state, virtualId);

      if (updates.pending) {
        return false;
      }
    }
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

export function updateDiscussion(discussion) {
  return async (dispatch, getState, { graphqlRequest }) => {
    if (process.env.BROWSER) {
      const state = getState();
      const updates = getDiscussionUpdates(state, discussion.id);

      if (updates.pending) {
        return false;
      }
    }
    dispatch({
      type: UPDATE_DISCUSSION_START,
    });
    try {
      const { data } = await graphqlRequest(updateDiscussionMutation, {
        discussion,
      });
      const normalizedData = normalize(data.updateDiscussion, discussionSchema);
      // TODO change filter structure of reducer

      dispatch({
        type: UPDATE_DISCUSSION_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_DISCUSSION_ERROR,
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
