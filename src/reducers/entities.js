import { normalize } from 'normalizr';
import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_START,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
} from '../constants';
import { proposal as proposalSchema } from '../store/schema';

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
    ...state,
    [pollId]: {
      ...poll,
      likedStatements: poll.likedStatements.filter(id => id !== statementLike.id),
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
        polls: {
          ...polls,
        },
        statements: {
          ...statements,
        },
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
        polls: {
          ...polls,
        },
        statements: {
          ...statements,
        },
        statementLikes: {
          ...other,
        },
      };
    }

    case LOAD_PROPOSAL_SUCCESS: {
      const normalizedData = normalize(action.payload.proposalDL, proposalSchema);
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
