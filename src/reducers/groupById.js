import merge from 'lodash.merge';

import {
  LOAD_GROUPS_SUCCESS,
  LOAD_GROUP_SUCCESS,
  CREATE_GROUP_SUCCESS,
  FETCH_USER_SUCCESS,
  JOIN_GROUP_SUCCESS,
  LEAVE_GROUP_SUCCESS,
  //  CREATE_REQUEST_SUCCESS,
  //  DELETE_REQUEST_SUCCESS,
} from '../constants';

export default function groups(state = {}, action) {
  switch (action.type) {
    case LOAD_GROUPS_SUCCESS:
    case FETCH_USER_SUCCESS:
    case LOAD_GROUP_SUCCESS:
    case LEAVE_GROUP_SUCCESS:
    case CREATE_GROUP_SUCCESS: {
      return merge({}, state, action.payload.entities.groups);
    }

    case JOIN_GROUP_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.groups,
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

export const getGroup = (state, id) => state[id] || {};
