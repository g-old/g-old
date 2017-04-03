import { normalize } from 'normalizr';
import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_START,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
  DELETE_VOTE_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_SUCCESS,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_VOTES_SUCCESS,
  LOAD_USERS_SUCCESS,
  UPDATE_USER_SUCCESS,
} from '../constants';
import {
  proposal as proposalSchema,
  statement as statementSchema,
  proposalList as proposalListSchema,
  voteList as voteListSchema,
  userList as userListSchema,
  user as userSchema,
} from '../store/schema';

// TODO https://www.npmjs.com/package/babel-plugin-transform-object-rest-spread

function updateStatementLikesCount(state, statementLike, up) {
  const { statementId } = statementLike;
  const statement = state[statementId];
  return {
    ...state,
    [statementId]: {
      ...statement,
      likes: up ? statement.likes + 1 : statement.likes - 1,
    },
  };
}

function updatePollVotesCount(state, vote) {
  const { pollId, position } = vote;
  const poll = state[pollId];
  const voteColumns = ['upvotes', 'downvotes'];
  const index = position === 'pro' ? 0 : 1;
  return {
    ...state,
    [pollId]: {
      ...poll,
      [voteColumns[index]]: poll[voteColumns[index]] + 1,
      [voteColumns[1 - index]]: poll[voteColumns[1 - index]] - 1,
      //upvotes: poll.upvotes + add,
      //downvotes: poll.downvotes + (1 - add),
    },
  };
}

function updateProposalVotesCount(state, vote, up) {
  let proposalId;
  // eslint-disable-next-line no-restricted-syntax
  for (const id in state) {
    // eslint-disable-next-line eqeqeq
    if (state[id].pollOne == vote.pollId || state[id].pollTwo == vote.pollId) {
      proposalId = id;
      break;
    }
  }
  const proposal = state[proposalId];
  return {
    ...state,
    [proposalId]: {
      ...proposal,
      votes: up ? proposal.votes + 1 : proposal.votes - 1,
    },
  };
}

function addLikeIdToLikedArray(state, statementLike) {
  const pollId = state.statements[statementLike.statementId].pollId;
  const poll = state.polls[pollId];
  return {
    ...state.polls,
    [pollId]: {
      ...poll,
      likedStatements: poll.likedStatements.concat([statementLike.id]),
    },
  };
}

function removeLikeIdFromArray(state, statementLike) {
  const pollId = state.statements[statementLike.statementId].pollId;
  const poll = state.polls[pollId];
  return {
    ...state.polls,
    [pollId]: {
      ...poll,
      likedStatements: poll.likedStatements.filter(id => id !== statementLike.id),
    },
  };
}

function removeStatement({ statements, polls }, statement) {
  // eslint-disable-next-line no-unused-vars
  const { [statement.id]: omit, ...other } = statements;
  return {
    statements: {
      ...other,
    },
    polls: {
      polls,
      [statement.pollId]: {
        ...polls[statement.pollId],
        ownStatement: null,
        // eslint-disable-next-line eqeqeq
        statements: polls[statement.pollId].statements.filter(id => id != statement.id),
      },
    },
  };
}

export default function entities(state = { proposals: {} }, action) {
  switch (action.type) {
    case CREATE_LIKE_SUCCESS: {
      const statementLike = action.payload.createStatementLike;
      const statements = updateStatementLikesCount(state.statements, statementLike, true);
      const polls = addLikeIdToLikedArray(state, statementLike);
      return {
        ...state,
        polls,
        statements,
        statementLikes: {
          ...state.statementLikes,
          [statementLike.id]: statementLike,
        },
      };
    }

    case DELETE_LIKE_SUCCESS: {
      const statementLike = action.payload.deleteStatementLike;
      const statements = updateStatementLikesCount(state.statements, statementLike);
      const polls = removeLikeIdFromArray(state, statementLike);
      // eslint-disable-next-line no-unused-vars
      const { [statementLike.id]: omit, ...other } = state.statementLikes;
      return {
        ...state,
        polls,
        statements,
        statementLikes: {
          ...other,
        },
      };
    }

    case CREATE_VOTE_SUCCESS: {
      const vote = action.payload.createVote;
      const proposals = updateProposalVotesCount(state.proposals, vote, true);
      const voteColumns = ['upvotes', 'downvotes'];
      const index = vote.position === 'pro' ? 0 : 1;
      return {
        ...state,
        proposals: {
          ...proposals,
        },
        polls: {
          ...state.polls,
          [vote.pollId]: {
            ...state.polls[vote.pollId],
            ownVote: vote.id,
            [voteColumns[index]]: state.polls[vote.pollId][voteColumns[index]] + 1,
          },
        },
        votes: {
          ...state.votes,
          [vote.id]: vote,
        },
      };
    }

    case UPDATE_VOTE_SUCCESS: {
      const ownVote = action.payload.updateVote;
      const polls = updatePollVotesCount(state.polls, ownVote);
      return {
        ...state,
        polls: {
          ...polls,
        },
        votes: {
          ...state.votes,
          [ownVote.id]: {
            ...state.votes[ownVote.id],
            position: ownVote.position,
          },
        },
      };
    }
    // TODO Refactor!
    case DELETE_VOTE_SUCCESS: {
      const ownVote = action.payload.deleteVote;
      const updatedProposals = updateProposalVotesCount(state.proposals, ownVote);
      const voteColumns = ['upvotes', 'downvotes'];
      const index = ownVote.position === 'pro' ? 0 : 1;
      let updatedPolls = {
        ...state.polls,
        [ownVote.pollId]: {
          ...state.polls[ownVote.pollId],
          ownVote: null,
          [voteColumns[index]]: state.polls[ownVote.pollId][voteColumns[index]] - 1,
        },
      };
      // eslint-disable-next-line no-unused-vars
      const { [ownVote.id]: omit, ...other } = state.votes;

      const statementId = state.polls[ownVote.pollId].ownStatement;
      let updatedStatements = state.statements;
      if (statementId) {
        const { statements, polls } = removeStatement(state, state.statements[statementId]);

        updatedStatements = statements;
        updatedPolls = {
          ...updatedPolls,
          [ownVote.pollId]: {
            ...updatedPolls[ownVote.pollId], // ownVote: null
            statements: polls[ownVote.pollId].statements, // ownvote not null
            ownStatement: null,
          },
        };
      }

      return {
        ...state,
        votes: {
          ...other,
        },
        statements: updatedStatements,
        proposals: updatedProposals,
        polls: updatedPolls,
      };
    }

    case CREATE_STATEMENT_SUCCESS: {
      const statement = action.payload.createStatement;
      const normalizedData = normalize(statement, statementSchema);
      return {
        ...merge({}, state, normalizedData.entities),
        polls: {
          ...state.polls,
          [statement.pollId]: {
            ...state.polls[statement.pollId],
            ownStatement: statement.id,
          },
        },
      };
    }
    /* NOTE: If someone has liked his own statement, the references in
      likedStatements and the copy in statementLikes are currently not
      being deleted from the store!
      Suggestion: Don't allow users to like own statements
    */
    case DELETE_STATEMENT_SUCCESS: {
      const statement = action.payload.deleteStatement;
      // eslint-disable-next-line no-unused-vars
      const { [statement.id]: omit, ...other } = state.statements;
      return {
        ...state,
        statements: {
          ...other,
        },
        polls: {
          ...state.polls,
          [statement.pollId]: {
            ...state.polls[statement.pollId],
            ownStatement: null,
            // eslint-disable-next-line eqeqeq
            statements: state.polls[statement.pollId].statements.filter(id => id != statement.id),
          },
        },
      };
    }

    case UPDATE_STATEMENT_SUCCESS: {
      const statement = action.payload.updateStatement;
      const normalizedData = normalize(statement, statementSchema);
      return {
        ...merge({}, state, normalizedData.entities),
        /*  ...state,
        statements: {
          ...state.statements,
          [statement.id]: {
            ...state.statements[statement.id],
            ...statement,
          },
        },*/
      };
    }

    case LOAD_PROPOSAL_SUCCESS: {
      const normalizedData = normalize(action.payload.proposalDL, proposalSchema);
      return {
        ...merge({}, state, normalizedData.entities),
      };
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      const normalizedData = normalize(action.payload.proposalsDL, proposalListSchema);
      return {
        ...merge({}, state, normalizedData.entities),
      };
    }

    case LOAD_VOTES_SUCCESS: {
      // TODO Add votes to poll
      const normalizedData = normalize(action.payload.data.votes, voteListSchema);
      const pollId = action.payload.pollId;
      return {
        ...merge({}, state, normalizedData.entities),
        polls: {
          ...state.polls,
          [pollId]: {
            ...state.polls[pollId],
            votes: [...normalizedData.result],
          },
        },
      };
    }

    case LOAD_USERS_SUCCESS: {
      const normalizedData = normalize(action.payload.users, userListSchema);
      return {
        ...merge({}, state, normalizedData.entities),
      };
    }

    case UPDATE_USER_SUCCESS: {
      const normalizedData = normalize(action.payload.updateUser, userSchema);
      return {
        ...merge({}, state, normalizedData.entities),
      };
    }

    case LOAD_PROPOSAL_START: {
      //  TODO insert id with isFetching set to true - change success and error accordingly
      return {
        ...state,
      };
    }
    case LOAD_PROPOSAL_ERROR: {
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}
