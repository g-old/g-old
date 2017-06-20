import {
  LOAD_PROPOSAL_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  DELETE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
} from '../constants';

const sortStatementsByPoll = (stmts, votes) =>
  Object.keys(stmts).reduce((acc, curr) => {
    const statement = stmts[curr];

    const votePos = votes[statement.vote].position;

    return {
      ...acc,
      [statement.pollId]: {
        ids: [...new Set([...(acc[statement.pollId] ? acc[statement.pollId].ids : []), curr])],
        pro: [
          ...new Set([
            ...(acc[statement.pollId] ? acc[statement.pollId].pro : []),
            ...(votePos === 'pro' ? [curr] : []),
          ]),
        ],
        con: [
          ...new Set([
            ...(acc[statement.pollId] ? acc[statement.pollId].con : []),
            ...(votePos === 'con' ? [curr] : []),
          ]),
        ],
      },
    };
  }, {});
const byPoll = (state = {}, action) => {
  switch (action.type) {
    // case LOAD_PROPOSAL_LIST_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_FEED_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const sorted = sortStatementsByPoll(stmts, action.payload.entities.votes);
      return {
        ...state,
        ...sorted,
      };
    }
    case CREATE_STATEMENT_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const sorted = sortStatementsByPoll(stmts, action.payload.entities.votes);
      const pollId = stmts[action.payload.result].pollId;
      const currentState = state[pollId] || [];
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          ids: [...(currentState.ids || []), ...sorted[pollId].ids],
          pro: [...(currentState.pro || []), ...sorted[pollId].pro],
          con: [...(currentState.con || []), ...sorted[pollId].con],
        },
      };
    }

    case DELETE_STATEMENT_SUCCESS: {
      const statement = action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ids: state[statement.pollId].ids.filter(i => i !== statement.id),
          pro: state[statement.pollId].pro.filter(i => i !== statement.id),
          con: state[statement.pollId].con.filter(i => i !== statement.id),
        },
      };
    }

    case UPDATE_VOTE_SUCCESS:
    case DELETE_VOTE_SUCCESS: {
      if (!action.info) {
        // if info is not null, a statement was deleted cascading from vote.
        return state;
      }
      const vote = action.payload.entities.votes[action.payload.result];
      return {
        ...state,
        [vote.pollId]: {
          ...state[vote.pollId],
          ids: state[vote.pollId].ids.filter(i => i !== action.info),
          pro: state[vote.pollId].ids.filter(i => i !== action.info),
          con: state[vote.pollId].ids.filter(i => i !== action.info),
        },
      };
    }
    default:
      return state;
  }
};
export default byPoll;

export const getAllByPollId = (state, id) => (state[id] ? state[id].ids : []);

export const getFilteredByPollId = (state, id) => state[id] || [];
