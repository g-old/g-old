/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_FEED_START,
  LOAD_FEED_SUCCESS,
  LOAD_FEED_ERROR,
} from '../constants';

import { activityArray as activitiesSchema } from '../store/schema';
import { getFeedIsFetching, getSessionUser } from '../reducers';

const feed = `
query($userId:ID){
  feed (userId:$userId) {
  id
  type
  objectId
  verb
  createdAt
  actor {
    id
    name
    surname
    avatar
  }
  object {
    __typename
    ... on ProposalDL {
      id
      title
      publishedAt
      state
      body
      votes
      pollOne {
        id
        upvotes
        downvotes
        threshold
        start_time
        endTime
        allVoters
        closedAt
        mode{
          id
          withStatements
          unipolar
          thresholdRef
        }
      }
      pollTwo {
        id
        upvotes
        downvotes
        threshold
        start_time
        endTime
        allVoters
        closedAt
        mode{
          id
          withStatements
          unipolar
          thresholdRef
        }
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
        id
        position
      }
      author{
        id
        name
        surname
        avatar
      }

    }
    ... on VoteDL {
      id
      position
      pollId
      voter{
        id
        name
        surname
        avatar
      }
    }
    ... on Notification {
      id
      sender {
        name
        surname
        avatar
        id
      }
      msg
      title
    }
  }
}
}
`;
export function loadFeed(log) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getFeedIsFetching(state, log ? 'log' : 'all')) {
      return false;
    }
    let userId;
    if (log) {
      userId = getSessionUser(state).id;
    }
    dispatch({
      type: LOAD_FEED_START,
      log,
    });

    try {
      const { data } = await graphqlRequest(feed, { userId });
      const normalizedData = normalize(data.feed, activitiesSchema);
      dispatch({
        type: LOAD_FEED_SUCCESS,
        payload: normalizedData,
        log,
      });
    } catch (error) {
      dispatch({
        type: LOAD_FEED_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        log,
      });
      return false;
    }

    return true;
  };
}
