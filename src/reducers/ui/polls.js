import {
  LOAD_VOTES_SUCCESS,
  LOAD_VOTES_START,
  LOAD_VOTES_ERROR,
  CREATE_VOTE_START,
  CREATE_VOTE_ERROR,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_START,
  UPDATE_VOTE_SUCCESS,
  UPDATE_VOTE_ERROR,
  DELETE_VOTE_START,
  DELETE_VOTE_SUCCESS,
  DELETE_VOTE_ERROR,
} from '../../constants';

const polls = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_VOTE_SUCCESS:
    case DELETE_VOTE_SUCCESS:
    case CREATE_VOTE_SUCCESS: {
      const pollId = action.payload.entities.votes[action.payload.result].pollId;
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          mutations: {
            pending: false,
            success: true,
            error: null,
          },
        },
      };
    }
    case UPDATE_VOTE_START:
    case DELETE_VOTE_START:
    case CREATE_VOTE_START: {
      const pollId = action.pollId;
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          mutations: {
            pending: true,
            success: false,
            error: null,
          },
        },
      };
    }
    case UPDATE_VOTE_ERROR:
    case DELETE_VOTE_ERROR:
    case CREATE_VOTE_ERROR: {
      const pollId = action.pollId;
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          mutations: {
            pending: false,
            success: false,
            error: action.message,
          },
        },
      };
    }

    case LOAD_VOTES_START: {
      const pollId = action.id;

      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          pollFetching: {
            isFetching: true,
            errorMessage: null,
          },
        },
      };
    }
    case LOAD_VOTES_ERROR: {
      const pollId = action.id;

      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          pollFetching: {
            isFetching: false,
            errorMessage: action.message,
          },
        },
      };
    }
    case LOAD_VOTES_SUCCESS: {
      const pollId = action.id;

      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          pollFetching: {
            isFetching: false,
            errorMessage: null,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default polls;
export const getPoll = (state, id) => state[id] || {};
