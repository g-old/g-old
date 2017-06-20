import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_VOTES_SUCCESS,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
  DELETE_VOTE_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
  LOAD_FEED_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
} from '../constants';

export default function polls(state = {}, action) {
  switch (action.type) {
    case CREATE_VOTE_SUCCESS: {
      const vote = action.payload.entities.votes[action.payload.result];
      const voteColumns = ['upvotes', 'downvotes'];
      const index = vote.position === 'pro' ? 0 : 1;
      let votes = state[vote.pollId].votes;
      if (votes) {
        votes = [...state[vote.pollId].votes, vote.id];
      }
      return {
        ...state,
        [vote.pollId]: {
          ...state[vote.pollId],
          ownVote: vote.id,
          [voteColumns[index]]: state[vote.pollId][voteColumns[index]] + 1,
          votes,
        },
      };
    }
    case LOAD_VOTES_SUCCESS:
      // const newEntries = Object.keys(action.payload.proposals) || [];
      // return [...new Set([...state, ...newEntries])];
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          votes: [...action.payload.result], // TODO merge!
        },
      };
    case UPDATE_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
      return merge({}, state, action.payload.entities.polls);

    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case UPDATE_VOTE_SUCCESS: {
      const { pollId, position } = action.payload.entities.votes[action.payload.result];
      const poll = state[pollId];
      const voteColumns = ['upvotes', 'downvotes'];
      const index = position === 'pro' ? 0 : 1;
      const statementId = action.info;
      return {
        ...state,
        [pollId]: {
          ...poll,
          [voteColumns[index]]: poll[voteColumns[index]] + 1,
          [voteColumns[1 - index]]: poll[voteColumns[1 - index]] - 1,
          ownStatement: statementId ? null : state[pollId].ownStatement,
        },
      };
    }
    case DELETE_VOTE_SUCCESS: {
      const vote = action.payload.entities.votes[action.payload.result];
      const voteColumns = ['upvotes', 'downvotes'];
      const index = vote.position === 'pro' ? 0 : 1;
      const poll = state[vote.pollId];
      let statements = poll.statements;
      let votes = poll.votes;
      if (poll.ownStatement && poll.statements) {
        // eslint-disable-next-line eqeqeq
        statements = poll.statements.filter(id => id != poll.ownStatement);
      }
      if (poll.ownVote && poll.votes) {
        // eslint-disable-next-line eqeqeq
        votes = poll.votes.filter(id => id != poll.ownVote);
      }

      return {
        ...state,
        [vote.pollId]: {
          ...state[vote.pollId],
          ownVote: null,
          ownStatement: null,
          statements,
          [voteColumns[index]]: state[vote.pollId][voteColumns[index]] - 1,
          votes,
        },
      };
    }
    case CREATE_STATEMENT_SUCCESS: {
      const statement = action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: statement.id,
        },
      };
    }
    case DELETE_STATEMENT_SUCCESS: {
      const statement = action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: null,
          // eslint-disable-next-line eqeqeq
          statements: state[statement.pollId].statements.filter(id => id != statement.id),
        },
      };
    }

    case CREATE_LIKE_SUCCESS: {
      let likedStatements = state[action.pollId].likedStatements || [];
      likedStatements = [...likedStatements, action.payload.result];
      return {
        ...state,
        [action.pollId]: {
          ...state[action.pollId],
          likedStatements,
        },
      };
    }

    case DELETE_LIKE_SUCCESS: {
      let likedStatements = state[action.pollId].likedStatements || [];
      // eslint-disable-next-line eqeqeq
      likedStatements = likedStatements.filter(id => id != action.payload.result);
      return {
        ...state,
        [action.pollId]: {
          ...state[action.pollId],
          likedStatements,
        },
      };
    }

    default:
      return state;
  }
}
