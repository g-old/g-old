import {
  CREATE_GROUP_START,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP_ERROR,
  UPDATE_GROUP_START,
  UPDATE_GROUP_ERROR,
  UPDATE_GROUP_SUCCESS,
  DELETE_GROUP_START,
  DELETE_GROUP_ERROR,
  DELETE_GROUP_SUCCESS,
  JOIN_GROUP_START,
  JOIN_GROUP_SUCCESS,
  JOIN_GROUP_ERROR,
  LEAVE_GROUP_START,
  LEAVE_GROUP_SUCCESS,
  LEAVE_GROUP_ERROR,
} from '../../constants';

// import { getErrors, getSuccessState } from '../../core/helpers';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const groups = (state = initState, action) => {
  switch (action.type) {
    case JOIN_GROUP_START:
    case LEAVE_GROUP_START:
    case CREATE_GROUP_START:
    case UPDATE_GROUP_START:
    case DELETE_GROUP_START: {
      return {
        ...state,
        mutation: {
          pending: true,
          success: false,
          error: '',
        },
      };
    }
    case JOIN_GROUP_ERROR:
    case LEAVE_GROUP_ERROR:
    case CREATE_GROUP_ERROR:
    case UPDATE_GROUP_ERROR:
    case DELETE_GROUP_ERROR: {
      // const current = state[action.id];
      // const newState = getErrors(current, action);
      return {
        ...state,
        mutation: {
          pending: false,
          success: false,
          error: action.message,
        },
      };
    }
    case JOIN_GROUP_SUCCESS:
    case LEAVE_GROUP_SUCCESS:
    case CREATE_GROUP_SUCCESS:
    case UPDATE_GROUP_SUCCESS:
    case DELETE_GROUP_SUCCESS: {
      // const id = action.id; // Is initial id!
      // const current = state[id];
      // const newState = getSuccessState(current, action);
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
export default groups;

export const getStatus = state => state.mutation || {};
