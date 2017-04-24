import {
  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
  UPDATE_USER_START,
  UPDATE_USER_ERROR,
  UPDATE_USER_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_ERROR,
  UPLOAD_AVATAR_START,
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
} from '../../constants';

const users = (state = {}, action) => {
  switch (action.type) {
    case CREATE_USER_START:
    case UPLOAD_AVATAR_START:
    case RESET_PASSWORD_START:
    case UPDATE_USER_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }

    case UPDATE_USER_SUCCESS: {
      const id = action.payload.result;
      const current = state[id];
      const newState = Object.keys(current).reduce(
        (acc, curr) => {
          if (curr in action.properties && current[curr].pending) {
            // eslint-disable-next-line no-param-reassign
            acc[curr] = {
              pending: false,
              success: true,
              error: null,
            };
          }
          return acc;
        },
        {},
      );

      return {
        ...state,
        [id]: {
          ...state[id],
          ...newState,
        },
      };
    }
    case RESET_PASSWORD_ERROR:
    case CREATE_USER_ERROR:
    case UPLOAD_AVATAR_ERROR:
    case UPDATE_USER_ERROR: {
      const current = state[action.id];
      const newState = Object.keys(current).reduce(
        (acc, curr) => {
          if (curr in action.properties && current[curr].pending) {
            let error = action.message;
            if (action.message.fields) {
              // means only valid for specific property
              error = null;
              if (action.message.fields[curr]) {
                error = action.message.fields[curr];
              }
            }
            // eslint-disable-next-line no-param-reassign
            acc[curr] = {
              pending: false,
              success: false,
              error,
            };
          }
          return acc;
        },
        {},
      );
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...newState,
        },
      };
    }
    case RESET_PASSWORD_SUCCESS:
    case CREATE_USER_SUCCESS:
    case UPLOAD_AVATAR_SUCCESS: {
      const id = action.id; // Is initial id!
      const current = state[id];
      const newState = Object.keys(current).reduce(
        (acc, curr) => {
          if (curr in action.properties && current[curr].pending) {
            // eslint-disable-next-line no-param-reassign
            acc[curr] = {
              pending: false,
              success: true,
              error: null,
            };
          }
          return acc;
        },
        {},
      );
      return {
        ...state,
        [id]: {
          ...state[id],
          ...newState,
        },
      };
    }

    default:
      return state;
  }
};
export default users;

export const getStatus = (state, id) => state[id];
