import {
  CREATE_COMMENT_START,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_ERROR,
  UPDATE_COMMENT_START,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_ERROR,
  DELETE_COMMENT_START,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_ERROR,
  LOAD_REPLIES_START,
  LOAD_REPLIES_SUCCESS,
  LOAD_REPLIES_ERROR,
} from '../../constants';

const comments = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_COMMENT_START:
    case DELETE_COMMENT_START:
    case LOAD_REPLIES_START:
    case CREATE_COMMENT_START: {
      const id = action.id; // Is initial id!
      return {
        ...state,
        [id]: {
          pending: true,
          success: false,
          errorMessage: null,
        },
      };
    }
    case CREATE_COMMENT_SUCCESS:
    case UPDATE_COMMENT_SUCCESS:
    case LOAD_REPLIES_SUCCESS:
    case DELETE_COMMENT_SUCCESS: {
      const id = action.id; // Is initial id!
      return {
        ...state,
        [id]: {
          pending: false,
          success: true,
          errorMessage: null,
        },
      };
    }

    case UPDATE_COMMENT_ERROR:
    case DELETE_COMMENT_ERROR:
    case LOAD_REPLIES_ERROR:
    case CREATE_COMMENT_ERROR: {
      const id = action.id; // Is initial id!
      return {
        ...state,
        [id]: {
          pending: false,
          success: false,
          errorMessage: action.message,
        },
      };
    }

    default:
      return state;
  }
};

export const getUpdates = state => state;
export default comments;
