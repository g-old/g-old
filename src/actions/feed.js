/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_FEED_START,
  LOAD_FEED_SUCCESS,
  LOAD_FEED_ERROR,
} from '../constants';

import { activityArray as activitiesSchema } from '../store/schema';
import { getFeedIsFetching, getSessionUser } from '../reducers';
import { pollFieldsForList } from './proposal';
import { voteFields } from './vote';

const userFields = `
id
name
surname
thumbnail`;

const commentFields = `
id
parentId
content
numReplies
discussionId
createdAt
editedAt
author{
${userFields}
}
`;

export const activityFields = `
id
  type
  objectId
  verb
  info
  createdAt
  actor {
    id
    name
    surname
    thumbnail
  }
  object {
    __typename
    ... on Discussion {
      id
      createdAt
      title
      numComments
      closedAt
      content
      deletedAt
      author{
        ${userFields}
      }

    }

    ... on Comment {
      ${commentFields}
    }
    ... on ProposalDL {
      id
      title
      publishedAt
      state
      body
      votes
      workteamId
      deletedAt
      image
      summary
      pollOne {
        ${pollFieldsForList}
      }
      pollTwo {
        ${pollFieldsForList}

      }
    }
    ... on StatementDL {
      id
      likes
      text
      pollId
      createdAt
      updatedAt
      vote{
        ${voteFields}
      }
      author{
        id
        name
        surname
        thumbnail
      }

    }
    ... on VoteDL {
      ${voteFields}
    }

  }`;
const feed = `
query($userId:ID){
  feed (userId:$userId) {
  ${activityFields}
}
}
`;
export function loadFeed(log) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getFeedIsFetching(state, log ? 'log' : 'feed')) {
      return false;
    }
    let userId;
    if (log) {
      userId = getSessionUser(state).id;
    }
    dispatch({
      type: LOAD_FEED_START,
      log,
      filter: log ? 'log' : 'feed',
    });

    try {
      const { data } = await graphqlRequest(feed, { userId });
      if (!data.feed) {
        dispatch({
          type: LOAD_FEED_ERROR,
          payload: {
            error: data.errors,
          },
          message: data.message || 'Something went wrong',
          filter: log ? 'log' : 'feed',
        });
        return false;
      }
      const normalizedData = normalize(data.feed, activitiesSchema);
      dispatch({
        type: LOAD_FEED_SUCCESS,
        payload: normalizedData,
        filter: log ? 'log' : 'feed',
      });
    } catch (error) {
      dispatch({
        type: LOAD_FEED_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        filter: log ? 'log' : 'feed',
      });
      return false;
    }

    return true;
  };
}
