import {
  CREATE_SUBSCRIPTION_START,
  CREATE_SUBSCRIPTION_SUCCESS,
  CREATE_SUBSCRIPTION_ERROR,
  UPDATE_SUBSCRIPTION_START,
  UPDATE_SUBSCRIPTION_ERROR,
  UPDATE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTION_START,
  DELETE_SUBSCRIPTION_ERROR,
  DELETE_SUBSCRIPTION_SUCCESS,
} from '../../constants';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const subscriptions = (state = initState, action) => {
  switch (action.type) {
    case CREATE_SUBSCRIPTION_START:
    case UPDATE_SUBSCRIPTION_START:
    case DELETE_SUBSCRIPTION_START: {
      return {
        ...state,
        mutation: { pending: true, success: false, error: '' },
      };
    }

    case CREATE_SUBSCRIPTION_ERROR:
    case UPDATE_SUBSCRIPTION_ERROR:
    case DELETE_SUBSCRIPTION_ERROR: {
      return {
        ...state,
        mutation: {
          pending: false,
          success: false,
          error: action.message,
        },
      };
    }
    case CREATE_SUBSCRIPTION_SUCCESS:
    case UPDATE_SUBSCRIPTION_SUCCESS:
    case DELETE_SUBSCRIPTION_SUCCESS: {
      return {
        ...state,
        mutation: { pending: false, success: true, error: '' },
      };
    }

    default:
      return state;
  }
};
export default subscriptions;

export const getStatus = (state, id) => state[id] || {};
