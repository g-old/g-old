import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_VOTES_SUCCESS,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
  DELETE_VOTE_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  LOAD_ACTIVITIES_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

export default function votes(state = {}, action) {
  switch (action.type) {
    case CREATE_VOTE_SUCCESS:
      return merge({}, state, action.payload.entities.votes);
    case LOAD_VOTES_SUCCESS:
      return merge({}, state, action.payload.entities.votes);
    case LOAD_ACTIVITIES_SUCCESS:
    case LOAD_FEED_SUCCESS:
      return merge({}, state, action.payload.entities.votes);
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      return merge({}, state, action.payload.entities.votes);
    }
    case LOAD_PROPOSAL_SUCCESS:
      return merge({}, state, action.payload.entities.votes);
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.votes);
    }
    case SSE_UPDATE_SUCCESS: {
      return action.payload.entities.votes
        ? merge({}, state, action.payload.entities.votes)
        : state;
    }
    case UPDATE_VOTE_SUCCESS:
      return merge({}, state, action.payload.entities.votes);
    case DELETE_VOTE_SUCCESS: {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload.result]: omit, ...other } = state;
      return other;
    }
    case CREATE_STATEMENT_SUCCESS: {
      return merge({}, state, action.payload.entities.votes);
    }
    default:
      return state;
  }
}
