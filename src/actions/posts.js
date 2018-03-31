/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_FEED_START,
  LOAD_FEED_SUCCESS,
  LOAD_FEED_ERROR,
} from '../constants';

import { posts } from '../store/schema';
import { getPostsStatus } from '../reducers';

const userFields = `
id
name
surname
thumbnail`;

const voteFields = withUser => `
id
position
${withUser ? `voter { ${userFields} }` : ''}
pollId`;

/* const commentFields = `
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
`; */

const feed = `
query($userId:ID){
  feed (userId:$userId) {
  id
  group {
    id
    logo
    displayName
  }
  subject {
    __typename
    ... on Discussion {
      id
      createdAt
      title
      numComments
      closedAt
      content
      author{
        ${userFields}
      }

    }

    ... on ProposalDL {
      id
      title
      publishedAt
      state
      body
      votes
      workTeamId
      activePoll {
        id
        upvotes
        downvotes
        threshold
        start_time
        endTime
        allVoters
        closedAt
        ownVote {
          ${voteFields(false)}
        }
        followees {
          ${voteFields(true)}
        }
        statements {
          id
          pollId
          author {
            ${userFields}
          }
          position
          createdAt
          updatedAt
          deletedAt
        }
        mode{
          id
          withStatements
          unipolar
          thresholdRef
        }
      }
    }
  }
}
}
`;
export function loadFeed() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getPostsStatus(state).pending) {
      return false;
    }

    dispatch({
      type: LOAD_FEED_START,
    });

    try {
      const { data } = await graphqlRequest(feed);
      const normalizedData = normalize(data.feed, posts);
      dispatch({
        type: LOAD_FEED_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_FEED_ERROR,
        payload: {
          error: error.message || 'Something went wrong',
        },
      });
      return false;
    }

    return true;
  };
}
