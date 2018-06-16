import {
  CREATE_MESSAGE_START,
  CREATE_MESSAGE_SUCCESS,
  CREATE_MESSAGE_ERROR,
} from '../../constants';

// import { getErrors, getSuccessState } from '../../core/helpers';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const messages = (state = initState, action) => {
  switch (action.type) {
    case CREATE_MESSAGE_START: {
      return {
        ...state,
        mutation: {
          pending: true,
          success: false,
          error: '',
        },
      };
    }

    case CREATE_MESSAGE_ERROR: {
      return {
        ...state,
        mutation: {
          pending: false,
          success: false,
          error: action.message,
        },
      };
    }

    case CREATE_MESSAGE_SUCCESS: {
      return {
        ...state, // to get id of created message
        mutation: {
          pending: false,
          success: action.payload.result || true,
          error: '',
        },
      };
    }

    default:
      return state;
  }
};
export default messages;

export const getStatus = state => state.mutation || {};
