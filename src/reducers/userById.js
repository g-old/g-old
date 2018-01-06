import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_VOTES_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  LOAD_USERS_SUCCESS,
  CREATE_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  UPLOAD_AVATAR_SUCCESS,
  RESET_PASSWORD_SUCCESS,
  FIND_USER_SUCCESS,
  FETCH_USER_SUCCESS,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FEED_SUCCESS,
  SESSION_LOGIN_SUCCESS,
  SSE_UPDATE_SUCCESS,
  LOAD_WORKTEAMS_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  JOIN_WORKTEAM_SUCCESS,
  LEAVE_WORKTEAM_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_DISCUSSION_SUCCESS,
  LOAD_REPLIES_SUCCESS,
  LOAD_REQUESTS_SUCCESS,
  CREATE_REQUEST_SUCCESS,
} from '../constants';

const handleUsers = (state, action) => {
  const users = action.payload.entities.users;
  const newState = Object.keys(users).reduce(
    (acc, curr) => ({ ...acc, [curr]: { ...state[curr], ...users[curr] } }),
    {},
  );
  return {
    ...state,
    ...newState,
  };
};

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_FEED_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS:
    case LOAD_VOTES_SUCCESS:
    case CREATE_STATEMENT_SUCCESS:
    case LOAD_USERS_SUCCESS:
    case CREATE_USER_SUCCESS:
    case LOAD_WORKTEAMS_SUCCESS:
    case JOIN_WORKTEAM_SUCCESS:
    case UPLOAD_AVATAR_SUCCESS:
    case RESET_PASSWORD_SUCCESS:
    case FIND_USER_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_REPLIES_SUCCESS:
    case LOAD_REQUESTS_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case CREATE_REQUEST_SUCCESS:
    case SESSION_LOGIN_SUCCESS: {
      return merge({}, state, action.payload.entities.users);
    }

    case LEAVE_WORKTEAM_SUCCESS: {
      return {
        ...state,
        [action.payload.result]: {
          ...state[action.payload.result],
          workTeams:
            action.payload.entities.users[action.payload.result].workTeams,
        },
      };
    }
    case SSE_UPDATE_SUCCESS: {
      return action.payload.entities.users
        ? merge({}, state, action.payload.entities.users)
        : state;
    }
    case UPDATE_USER_SUCCESS: {
      // bc of deleted followees
      return handleUsers(state, action);
    }

    case FETCH_USER_SUCCESS: {
      // bc of permissions
      return handleUsers(state, action);
    }
    default:
      return state;
  }
}

export const getUser = (state, id) => state[id];
