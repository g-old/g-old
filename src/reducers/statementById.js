import merge from 'lodash.merge';

import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  DELETE_VOTE_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  UPDATE_FLAGGEDSTMT_SUCCESS,
  LOAD_FEED_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

export default function statements(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
      return merge({}, state, action.payload.entities.statements);
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case DELETE_VOTE_SUCCESS: {
      const voteId = action.payload.result;
      const ownStatementId = Object.keys(state).find(id => state[id].vote === voteId);
      if (!ownStatementId) return state;
      // eslint-disable-next-line no-unused-vars
      const { ownStatementId: omit, ...other } = state;
      return other;
    }
    case SSE_UPDATE_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const activity = action.payload.entities.activities[action.payload.result];
      if (activity.type === 'statement' && activity.verb === 'delete') {
        // check first if in store
        /*  if (state[activity.objectId]) {
          // eslint-disable-next-line no-unused-vars

          const { [activity.objectId]: omit, ...other } = state;
          return other;
        } */
        return state;
      }
      return merge({}, state, action.payload.entities.statements);
    }
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case CREATE_STATEMENT_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case UPDATE_STATEMENT_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case UPDATE_FLAGGEDSTMT_SUCCESS: {
      return merge({}, state, action.payload.entities.statements);
    }
    case DELETE_STATEMENT_SUCCESS: {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload.result]: omit, ...other } = state;
      return other;
    }
    case CREATE_LIKE_SUCCESS: {
      const like = action.payload.entities.statementLikes[action.payload.result];
      return {
        ...state,
        [like.statementId]: {
          ...state[like.statementId],
          likes: state[like.statementId].likes + 1,
        },
      };
    }
    case DELETE_LIKE_SUCCESS: {
      const like = action.payload.entities.statementLikes[action.payload.result];
      return {
        ...state,
        [like.statementId]: {
          ...state[like.statementId],
          likes: state[like.statementId].likes - 1,
        },
      };
    }
    default:
      return state;
  }
}

export const getStatement = (state, id) => state[id];
