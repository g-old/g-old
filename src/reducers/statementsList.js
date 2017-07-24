import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const allIds = (state = [], action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_LIST_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_FEED_SUCCESS:
    case CREATE_STATEMENT_SUCCESS:
    case SSE_UPDATE_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      const stmts = action.payload.entities.statements;
      return stmts ? [...new Set([...state, ...Object.keys(stmts)])] : state;
    }
    case DELETE_STATEMENT_SUCCESS: {
      return state.filter(id => id !== action.payload.result);
    }
    default:
      return state;
  }
};
export default allIds;

export const getAllStatements = state => state;
