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
    case CREATE_STATEMENT_SUCCESS:
    case UPDATE_STATEMENT_SUCCESS:
    case DELETE_STATEMENT_SUCCESS: {
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

    case UPDATE_STATEMENT_ERROR:
    case DELETE_STATEMENT_ERROR:
    case CREATE_STATEMENT_ERROR: {
      const id = action.id; // Is initial id!
      const statement = action.statement;
      return {
        ...state,
        [id]: {
          pending: false,
          success: false,
          errorMessage: action.message,
          statement,
        },
      };
    }

    default:
      return state;
  }
};

export const getUpdates = state => state;
export default statements;
