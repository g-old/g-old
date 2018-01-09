import merge from 'lodash.merge';

import {
  LOAD_WORKTEAMS_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_SUCCESS,
  FETCH_USER_SUCCESS,
  JOIN_WORKTEAM_SUCCESS,
  LEAVE_WORKTEAM_SUCCESS,
  //  CREATE_REQUEST_SUCCESS,
  //  DELETE_REQUEST_SUCCESS,
} from '../constants';

export default function workTeams(state = {}, action) {
  switch (action.type) {
    case LOAD_WORKTEAMS_SUCCESS:
    case FETCH_USER_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LEAVE_WORKTEAM_SUCCESS:
    case CREATE_WORKTEAM_SUCCESS: {
      return merge({}, state, action.payload.entities.workTeams);
    }

    case JOIN_WORKTEAM_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.workTeams,
      };
    }

    /* case CREATE_REQUEST_SUCCESS: {
      const request = action.payload.entities.requests[action.payload.result];
      if (request.type === 'joinWT') {
        console.log('JOSN CONTENT', request);

        const content = JSON.parse(request.content);

        return {
          ...state,
          [content.id]: {
            ...state[content.id],
            ownStatus: {
              ...state[content.id].ownStatus,
              request: request.id,
            },
          },
        };
      }
      return state;
    }
    case DELETE_REQUEST_SUCCESS: {
      const request = action.payload.entities.requests[action.payload.result];
      if (request.type === 'joinWT') {
        console.log('JOSN CONTENT', request);
        const content = JSON.parse(request.content);
        return {
          ...state,
          [content.id]: {
            ...state[content.id],
            ownStatus: {
              ...state[content.id].ownStatus,
              request: null,
            },
          },
        };
      }
      return state;
    }
*/
    default: {
      return state;
    }
  }
}

export const getWorkTeam = (state, id) => state[id] || {};
