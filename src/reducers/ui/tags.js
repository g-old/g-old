import {
  CREATE_TAG_START,
  CREATE_TAG_SUCCESS,
  CREATE_TAG_ERROR,
  UPDATE_TAG_START,
  UPDATE_TAG_ERROR,
  UPDATE_TAG_SUCCESS,
  DELETE_TAG_START,
  DELETE_TAG_ERROR,
  DELETE_TAG_SUCCESS,
} from '../../constants';

// import { getErrors, getSuccessState } from '../../core/helpers';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const tags = (state = initState, action) => {
  switch (action.type) {
    case CREATE_TAG_START:
    case UPDATE_TAG_START:
    case DELETE_TAG_START: {
      return {
        ...state,
        mutation: {
          pending: true,
          success: false,
          error: '',
        },
      };
    }

    case CREATE_TAG_ERROR:
    case UPDATE_TAG_ERROR:
    case DELETE_TAG_ERROR: {
      return {
        ...state,
        mutation: {
          pending: false,
          success: false,
          error: action.message,
        },
      };
    }

    case CREATE_TAG_SUCCESS:
    case UPDATE_TAG_SUCCESS:
    case DELETE_TAG_SUCCESS: {
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
export default tags;

export const getStatus = state => state.mutation || {};
