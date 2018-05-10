import {
  CREATE_NOTIFICATION_START,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_ERROR,
  UPDATE_NOTIFICATION_START,
  UPDATE_NOTIFICATION_ERROR,
  UPDATE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_START,
  DELETE_NOTIFICATION_ERROR,
  DELETE_NOTIFICATION_SUCCESS,
  CLEAR_NOTIFICATIONS_START,
  CLEAR_NOTIFICATIONS_ERROR,
  CLEAR_NOTIFICATIONS_SUCCESS,
} from '../../constants';

import { getErrors, getSuccessState } from '../../core/helpers';

const notifications = (state = {}, action) => {
  switch (action.type) {
    case CLEAR_NOTIFICATIONS_START:
    case CREATE_NOTIFICATION_START:
    case UPDATE_NOTIFICATION_START:
    case DELETE_NOTIFICATION_START: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.properties,
        },
      };
    }
    case CLEAR_NOTIFICATIONS_ERROR:
    case CREATE_NOTIFICATION_ERROR:
    case UPDATE_NOTIFICATION_ERROR:
    case DELETE_NOTIFICATION_ERROR: {
      const current = state[action.id];
      const newState = getErrors(current, action);
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...newState,
        },
      };
    }
    case CLEAR_NOTIFICATIONS_SUCCESS:
    case CREATE_NOTIFICATION_SUCCESS:
    case UPDATE_NOTIFICATION_SUCCESS:
    case DELETE_NOTIFICATION_SUCCESS: {
      const { id } = action; // Is initial id!
      const current = state[id];
      const newState = getSuccessState(current, action);
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
export default notifications;

export const getStatus = (state, id) => state[id] || {};
