import {
  LOAD_PROPOSAL_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  DELETE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const sortStatementsByPoll = (stmts, votes) =>
  Object.keys(stmts).reduce((acc, curr) => {
    const statement = stmts[curr];
    const vote = votes[statement.vote];
    if (!vote) return {};
    const votePos =
      vote.positions[0].pos === 1 && vote.positions[0].value ? 'pro' : 'con';

    return {
      ...acc,
      [statement.pollId]: {
        all: [
          ...new Set([
            curr,
            ...(acc[statement.pollId] ? acc[statement.pollId].all : []),
          ]),
        ],
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
    case SSE_UPDATE_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const activity =
        action.payload.entities.activities[action.payload.result];
      const { pollId } = stmts[activity.objectId];

      if (activity.type === 'statement' && activity.verb === 'delete') {
        // check first if polls are in store
        if (state[pollId]) {
          // eslint-disable-next-line no-unused-vars
          return {
            ...state,
            [pollId]: {
              all: state[pollId].all.filter(i => i !== activity.objectId),
              pro: state[pollId].pro.filter(i => i !== activity.objectId),
              con: state[pollId].con.filter(i => i !== activity.objectId),
            },
          };
        }
        return state;
      }

      const sorted = sortStatementsByPoll(stmts, action.payload.entities.votes);
      const currentState = state[pollId] || [];
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          all: [
            ...new Set([...sorted[pollId].all, ...(currentState.all || [])]),
          ],
          pro: [
            ...new Set([...sorted[pollId].pro, ...(currentState.pro || [])]),
          ],
          con: [
            ...new Set([...sorted[pollId].con, ...(currentState.con || [])]),
          ],
        },
      };
    }
    case CREATE_STATEMENT_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const sorted = sortStatementsByPoll(stmts, action.payload.entities.votes);
      const { pollId } = stmts[action.payload.result];
      const currentState = state[pollId] || [];
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          all: [
            ...new Set([...sorted[pollId].all, ...(currentState.all || [])]),
          ],
          pro: [
            ...new Set([...sorted[pollId].pro, ...(currentState.pro || [])]),
          ],
          con: [
            ...new Set([...sorted[pollId].con, ...(currentState.con || [])]),
          ],
        },
      };
    }

    case DELETE_STATEMENT_SUCCESS: {
      const statement =
        action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          all: state[statement.pollId].all.filter(i => i !== statement.id),
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
          all: state[vote.pollId].all.filter(i => i !== action.info),
          pro: state[vote.pollId].pro.filter(i => i !== action.info),
          con: state[vote.pollId].con.filter(i => i !== action.info),
        },
      };
    }
    default:
      return state;
  }
};
export default byPoll;

export const getAllByPollId = (state, id) => (state[id] ? state[id].all : []);

export const getFilteredByPollId = (state, id) => state[id] || [];
