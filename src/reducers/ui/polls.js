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

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const polls = (state = initState, action) => {
  switch (action.type) {
    case LOAD_VOTES_SUCCESS:
    case UPDATE_VOTE_SUCCESS:
    case DELETE_VOTE_SUCCESS:
    case CREATE_VOTE_SUCCESS: {
      return {
        ...state,
        mutation: { pending: false, success: true, error: '' },
      };
    }
    case LOAD_VOTES_START:
    case UPDATE_VOTE_START:
    case DELETE_VOTE_START:
    case CREATE_VOTE_START: {
      return {
        ...state,
        mutation: { pending: true, success: false, error: '' },
      };
    }
    case LOAD_VOTES_ERROR:
    case UPDATE_VOTE_ERROR:
    case DELETE_VOTE_ERROR:
    case CREATE_VOTE_ERROR: {
      return {
        ...state,
        mutation: { pending: false, success: false, error: action.message },
      };
    }

    default:
      return state;
  }
};

export default polls;
export const getStatus = state => state.mutation || {};
