import {
  CREATE_WORKTEAM_START,
  CREATE_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_ERROR,
  UPDATE_WORKTEAM_START,
  UPDATE_WORKTEAM_ERROR,
  UPDATE_WORKTEAM_SUCCESS,
  DELETE_WORKTEAM_START,
  DELETE_WORKTEAM_ERROR,
  DELETE_WORKTEAM_SUCCESS,
} from '../../constants';

// import { getErrors, getSuccessState } from '../../core/helpers';

const initState = {
  mutation: {
    success: false,
    error: '',
    pending: false,
  },
};
const workTeams = (state = initState, action) => {
  switch (action.type) {
    case CREATE_WORKTEAM_START:
    case UPDATE_WORKTEAM_START:
    case DELETE_WORKTEAM_START: {
      return {
        ...state,
        mutation: {
          pending: true,
          success: false,
          error: '',
        },
      };
    }

    case CREATE_WORKTEAM_ERROR:
    case UPDATE_WORKTEAM_ERROR:
    case DELETE_WORKTEAM_ERROR: {
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
    case CREATE_WORKTEAM_SUCCESS:
    case UPDATE_WORKTEAM_SUCCESS:
    case DELETE_WORKTEAM_SUCCESS: {
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
export default workTeams;

export const getStatus = state => state.mutation || {};
