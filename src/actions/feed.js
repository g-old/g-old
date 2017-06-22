/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { LOAD_FEED_START, LOAD_FEED_SUCCESS, LOAD_FEED_ERROR } from '../constants';

import { activityArray as activitiesSchema } from '../store/schema';
import { getFeedIsFetching } from '../reducers';

const feed = `
query{
  feed {
  id
  type
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
      pollOne {  id
        upvotes
        downvotes
        threshold
        start_time
        endTime
        allVoters
        mode{
          id
          withStatements
          unipolar
          thresholdRef
        }}
      pollTwo {  id
        upvotes
        downvotes
        threshold
        start_time
        endTime
        allVoters
        mode{
          id
          withStatements
          unipolar
          thresholdRef
        }}
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
  }
}
}
`;

export function loadFeed() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    if (getFeedIsFetching(getState())) {
      return false;
    }
    dispatch({
      type: LOAD_FEED_START,
    });

    try {
      const { data } = await graphqlRequest(feed);
      const normalizedData = normalize(data.feed, activitiesSchema);
      dispatch({
        type: LOAD_FEED_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_FEED_ERROR,
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
