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
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_SUCCESS,
  UPDATE_USER_START,
  UPDATE_USER_ERROR,
  UPDATE_USER_SUCCESS,
} from '../constants';

export default function ui(state = { statements: {}, updates: {} }, action) {
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
    case RESET_PASSWORD_ERROR: {
      return {
        ...state,
        resetError: true,
        resetSuccess: false,
      };
    }
    case RESET_PASSWORD_SUCCESS: {
      return {
        ...state,
        resetError: false,
        resetSuccess: true,
      };
    }

    case UPDATE_USER_START: {
      // TODO reset success
      return {
        ...state,
        updates: {
          ...state.updates,
          [action.payload.user.id]: {
            ...state.updates[action.payload.user.id],
            ...action.payload.ui,
          },
        },
      };
    }

    case UPDATE_USER_SUCCESS: {
      const { updateUser: { id }, properties } = action.payload;
      const current = state.updates[id];
      const newState = Object.keys(current).reduce(
        (acc, curr) => {
          if (curr in properties && current[curr].pending) {
            // eslint-disable-next-line no-param-reassign
            acc[curr] = {
              pending: false,
              success: true,
            };
          }
          return acc;
        },
        {},
      );

      return {
        ...state,
        updates: {
          ...state.updates,
          [id]: {
            ...state.updates[id],
            ...newState,
          },
        },
      };
    }

    case UPDATE_USER_ERROR: {
      const { user: { id }, properties } = action.payload;
      const current = state.updates[id];
      const newState = Object.keys(current).reduce(
        (acc, curr) => {
          if (curr in properties && current[curr].pending) {
            // eslint-disable-next-line no-param-reassign
            acc[curr] = {
              pending: false,
              error: true,
            };
          }
          return acc;
        },
        {},
      );
      return {
        ...state,
        updates: {
          ...state.updates,
          [id]: {
            ...state.updates[id],
            ...newState,
          },
        },
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
