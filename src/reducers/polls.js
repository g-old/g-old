import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_NOTIFICATIONS_SUCCESS,
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
  LOAD_WORKTEAM_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const updatePolls = (state, action) => {
  let deleteVote;
  let updatedPolls;
  let updateVote;
  const activity = action.payload.entities.activities[action.payload.result];
  if (activity && activity.type === 'vote') {
    if (activity.verb === 'delete') {
      deleteVote = true;
    } else if (activity.verb === 'update') {
      updateVote = true;
    }

    updatedPolls = Object.keys(action.payload.entities.votes).reduce(
      (agg, curr) => {
        const vote = action.payload.entities.votes[curr];
        if (state[vote.pollId]) {
          if (vote.position === 'pro') {
            /* eslint-disable no-param-reassign */
            if (updateVote) {
              agg[vote.pollId] = {
                ...state[vote.pollId],
                upvotes: state[vote.pollId].upvotes + 1,
                downvotes: state[vote.pollId].downvotes - 1,
              };
            } else {
              agg[vote.pollId] = {
                ...state[vote.pollId],
                upvotes: deleteVote
                  ? state[vote.pollId].upvotes - 1
                  : state[vote.pollId].upvotes + 1,
              };
            }
          } else if (updateVote) {
            agg[vote.pollId] = {
              ...state[vote.pollId],
              upvotes: state[vote.pollId].upvotes - 1,
              downvotes: state[vote.pollId].downvotes + 1,
            };
          } else {
            // eslint-disable-next-line no-param-reassign
            agg[vote.pollId] = {
              ...state[vote.pollId],
              downvotes: deleteVote
                ? state[vote.pollId].downvotes - 1
                : state[vote.pollId].downvotes + 1,
            };
          }
        }
        /* eslint-enable no-param-reassign */

        return agg;
      },
      {},
    );
  }
  return updatedPolls;
};

export default function polls(state = {}, action) {
  switch (action.type) {
    case CREATE_VOTE_SUCCESS: {
      const vote = action.payload.entities.votes[action.payload.result];
      const voteColumns = ['upvotes', 'downvotes'];
      const index = vote.position === 'pro' ? 0 : 1;
      let votes = state[vote.pollId].votes; // eslint-disable-line
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
    case LOAD_NOTIFICATIONS_SUCCESS:
    case UPDATE_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
      return merge({}, state, action.payload.entities.polls);
    case SSE_UPDATE_SUCCESS: {
      // ! Works only if we are not including the poll
      let updatedPolls;
      if (action.payload.entities.votes) {
        updatedPolls = updatePolls(state, action);
      }
      if (updatedPolls || action.payload.entities.polls) {
        return merge({}, state, updatedPolls, action.payload.entities.polls);
      }
      return state;
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case UPDATE_VOTE_SUCCESS: {
      const { pollId, position } = action.payload.entities.votes[
        action.payload.result
      ];
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
      let { statements, votes } = poll;

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
      const statement =
        action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: statement.id,
        },
      };
    }
    case DELETE_STATEMENT_SUCCESS: {
      const statement =
        action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: null,
          statements: state[statement.pollId].statements.filter(
            id => id != statement.id, // eslint-disable-line eqeqeq
          ),
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
      likedStatements = likedStatements.filter(
        id => id != action.payload.result, // eslint-disable-line eqeqeq
      );
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
