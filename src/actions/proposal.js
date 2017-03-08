/* eslint-disable import/prefer-default-export */

import {
  LOAD_PROPOSAL_START,
LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
} from '../constants';

const query = `
  query ($id:ID!) {
    proposalDL (id:$id) {
      id
      title
      publishedAt
      body
      pollOne{
        id
        ownVote{
          id
          position
        }
        upvotes
        downvotes
        followees{
          id
          position
          voter{
            id
            name
            surname
          }
        }
        mode{
          id
          with_statements
        }
        statements{
          id
          title
          text
          vote{
            id
            position
          }
        }
      }
    }
  }
`;

export function loadProposal({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO
    const { proposals } = getState().entities;
    if (proposals[id]) {
      // TODO: Add checks to ensure we have a valid, cached object.
      return true;
    }
    dispatch({
      type: LOAD_PROPOSAL_START,
      payload: {
        id,
      },
    });

    try {
      const { data } = await graphqlRequest(query, { id });
      dispatch({
        type: LOAD_PROPOSAL_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PROPOSAL_ERROR,
        payload: {
          id,
          error,
        },
      });
      return false;
    }

    return true;
  };
}
