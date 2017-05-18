import merge from 'lodash.merge';

import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
} from '../constants';

const byPoll = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_LIST_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_FEED_SUCCESS:
    case CREATE_STATEMENT_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      const stmts = action.payload.entities.statements;
      if (!stmts) return state;
      const allIDS = Object.keys(stmts).reduce((acc, curr) => {
        const statement = stmts[curr];

        const votePos = action.payload.entities.votes[statement.vote].position;

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

      return merge({}, state, allIDS);
    }
    case DELETE_STATEMENT_SUCCESS: {
      return state.filter(id => id !== action.payload.result);
    }
    default:
      return state;
  }
};
export default byPoll;

export const getAllByPollId = (state, id) => (state[id] ? state[id].ids : []);
