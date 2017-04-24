import {
  CREATE_STATEMENT_START,
  CREATE_STATEMENT_SUCCESS,
  CREATE_STATEMENT_ERROR,
  UPDATE_STATEMENT_START,
  UPDATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_ERROR,
  DELETE_STATEMENT_START,
  DELETE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_ERROR,
} from '../../constants';

const statements = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_STATEMENT_START:
    case DELETE_STATEMENT_START:
    case CREATE_STATEMENT_START: {
      const id = action.id;
      return {
        ...state,
        [id]: {
          ...state[id],
          mutations: {
            pending: true,
            success: false,
            error: null,
          },
        },
      };
    }
    case UPDATE_STATEMENT_SUCCESS:
    case DELETE_STATEMENT_SUCCESS: {
      const id = action.payload.result;
      return {
        ...state,
        [id]: {
          ...state[id],
          mutations: {
            pending: false,
            success: true,
            error: null,
          },
        },
      };
    }

    case CREATE_STATEMENT_SUCCESS: {
      const id = action.id;
      return {
        ...state,
        [id]: {
          ...state[id],
          mutations: {
            pending: false,
            success: true,
            error: null,
          },
        },
      };
    }

    case UPDATE_STATEMENT_ERROR:
    case DELETE_STATEMENT_ERROR:
    case CREATE_STATEMENT_ERROR: {
      const id = action.id;
      return {
        ...state,
        [id]: {
          ...state[id],
          mutations: {
            pending: false,
            success: false,
            error: action.message,
          },
        },
      };
    }

    default:
      return state;
  }
};

export const getStatementIsPending = (state, id) => {
  if (state[id] && state[id].mutations) {
    return state[id].mutations.pending;
  }
  return false;
};
export const getStatementSuccess = (state, id) => {
  if (state[id] && state[id].mutations) {
    return state[id].mutations.success;
  }
  return false;
};
export const getStatementError = (state, id) => {
  if (state[id] && state[id].mutations) {
    return state[id].mutations.error;
  }
  return null;
};
export default statements;
