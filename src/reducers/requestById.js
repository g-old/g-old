import {
  LOAD_REQUESTS_SUCCESS,
  CREATE_REQUEST_SUCCESS,
  UPDATE_REQUEST_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  FETCH_USER_SUCCESS,
  LOAD_ACTIVITIES_SUCCESS,
} from '../constants';

const parseRequests = requests =>
  Object.keys(requests).reduce((acc, curr) => {
    if (requests[curr].content) {
      acc[curr] = {
        ...requests[curr],
        content: JSON.parse(requests[curr].content),
      };
    } else {
      acc[curr] = requests[curr];
    }
    return acc;
  }, {});

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_REQUESTS_SUCCESS:
    case UPDATE_REQUEST_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case FETCH_USER_SUCCESS:
    case LOAD_ACTIVITIES_SUCCESS:
    case CREATE_REQUEST_SUCCESS: {
      return action.payload.entities.requests
        ? {
            ...state,
            ...parseRequests(action.payload.entities.requests),
          }
        : state;
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
