import {
  UPDATE_STATEMENT_START,
  UPDATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_ERROR,
  DELETE_STATEMENT_SUCCESS,
  SHOW_STATEMENTINPUT,
  HIDE_STATEMENTINPUT,
  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
  SESSION_LOGOUT_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_START,
  UPLOAD_AVATAR_ERROR,
} from '../constants';

export default function ui(state = { statements: {} }, action) {
  switch (action.type) {
    case UPDATE_STATEMENT_START: {
      const statementId = action.payload.statement.id;
      return {
        ...state,
        statements: {
          ...state.statements,
          [statementId]: {
            ...state.statements[statementId],
            updating: true,
          },
        },
      };
    }

    case UPDATE_STATEMENT_SUCCESS: {
      const statementId = action.payload.updateStatement.id;
      return {
        ...state,
        statements: {
          ...state.statements,
          [statementId]: {
            ...state.statements[statementId],
            updating: false,
          },
        },
      };
    }

    case UPDATE_STATEMENT_ERROR: {
      const statementId = action.payload.updateStatement.id;
      return {
        ...state,
        statements: {
          ...state.statements,
          [statementId]: {
            ...state.statements[statementId],
            updating: false,
            error: action.payload.error,
          },
        },
      };
    }
    // TODO maybe delete statements from ui? set something
    case DELETE_STATEMENT_SUCCESS: {
      const statementId = action.payload.deleteStatement.id;
      return {
        ...state,
        statements: {
          ...state.statements,
          [statementId]: {
            ...state.statements[statementId],
            updating: false,
            error: action.payload.error,
          },
        },
      };
    }
    case CREATE_USER_START: {
      return {
        ...state,
        signupError: null,
        signupProcessing: true,
      };
    }

    case CREATE_USER_SUCCESS: {
      return {
        ...state,
        signupStep: 2,
        signupProcessing: false,
      };
    }
    case CREATE_USER_ERROR: {
      return {
        ...state,
        signupError: action.payload.error,
        signupProcessing: false,
      };
    }
    case SESSION_LOGOUT_SUCCESS: {
      return { statements: {} };
    }

    case UPLOAD_AVATAR_SUCCESS: {
      return {
        ...state,
        avatarUploadPending: false,
        avatarUploaded: true,
      };
    }

    case UPLOAD_AVATAR_START: {
      return {
        ...state,
        avatarUploadPending: true,
        avatarUploaded: false,
      };
    }
    case UPLOAD_AVATAR_ERROR: {
      return {
        ...state,
        avatarUploadPending: false,
        avatarUploaded: false,
      };
    }

    case SHOW_STATEMENTINPUT: {
      return {
        ...state,
        statementInput: {
          ...state.statementInput,
          display: true,
        },
      };
    }

    case HIDE_STATEMENTINPUT: {
      return {
        ...state,
        statementInput: {
          ...state.statementInput,
          display: false,
        },
      };
    }
    default:
      return state;
  }
}
