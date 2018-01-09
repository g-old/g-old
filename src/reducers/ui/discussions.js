import {
  CREATE_DISCUSSION_START,
  CREATE_DISCUSSION_SUCCESS,
  CREATE_DISCUSSION_ERROR,
  UPDATE_DISCUSSION_START,
  UPDATE_DISCUSSION_ERROR,
  UPDATE_DISCUSSION_SUCCESS,
  DELETE_DISCUSSION_START,
  DELETE_DISCUSSION_ERROR,
  DELETE_DISCUSSION_SUCCESS,
} from '../../constants';

// import { getErrors, getSuccessState } from '../../core/helpers';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const discussions = (state = initState, action) => {
  switch (action.type) {
    case CREATE_DISCUSSION_START:
    case UPDATE_DISCUSSION_START:
    case DELETE_DISCUSSION_START: {
      return {
        ...state,
        mutation: {
          pending: true,
          success: false,
          error: '',
        },
      };
    }

    case CREATE_DISCUSSION_ERROR:
    case UPDATE_DISCUSSION_ERROR:
    case DELETE_DISCUSSION_ERROR: {
      return {
        ...state,
        mutation: {
          pending: false,
          success: false,
          error: action.message,
        },
      };
    }

    case CREATE_DISCUSSION_SUCCESS:
    case UPDATE_DISCUSSION_SUCCESS:
    case DELETE_DISCUSSION_SUCCESS: {
      return {
        ...state,
        mutation: {
          pending: false,
          success: true,
          error: '',
        },
      };
    }

    default:
      return state;
  }
};
export default discussions;

export const getStatus = state => state.mutation || {};
