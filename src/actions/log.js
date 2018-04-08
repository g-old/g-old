/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_LOGS_START,
  LOAD_LOGS_SUCCESS,
  LOAD_LOGS_ERROR,
} from '../constants';
import { requestFields } from './request';

import { logList as logsSchema } from '../store/schema';
import { getLogIsFetching, getSessionUser } from '../reducers';

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

const logs = `
query($userId:ID){
  logs (userId:$userId) {
  id
  type
  objectId
  verb
  createdAt
  actor {
    id
    name
    surname
    thumbnail
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
      position
      author{
        id
        name
        surname
        thumbnail
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
        thumbnail
      }
    }
    ... on Comment {
      ${commentFields}
    }
    ... on Message {
      id
      sender {
        name
        surname
        thumbnail
        id
      }
      msg
      title
    }
    ... on Request {
      ${requestFields}
    }
  }
}
}
`;
export function loadLogs() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getLogIsFetching(state)) {
      return false;
    }

    const userId = getSessionUser(state).id;

    dispatch({
      type: LOAD_LOGS_START,
    });

    try {
      const { data } = await graphqlRequest(logs, { userId });

      const normalizedData = normalize(data.logs, logsSchema);

      dispatch({
        type: LOAD_LOGS_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_LOGS_ERROR,
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
