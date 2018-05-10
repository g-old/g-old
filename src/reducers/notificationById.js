import {
  LOAD_NOTIFICATIONS_SUCCESS,
  CREATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_SUCCESS,
  CLEAR_NOTIFICATIONS_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_NOTIFICATIONS_SUCCESS:
    case UPDATE_NOTIFICATION_SUCCESS:
    case CREATE_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.notifications,
      };
    }
    case CLEAR_NOTIFICATIONS_SUCCESS: {
      return Object.keys(state).reduce((newState, notificationId) => {
        // eslint-disable-next-line
        newState[notificationId] = { ...state[notificationId], read: true };
        return newState;
      }, {});
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
