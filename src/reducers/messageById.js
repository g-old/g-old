import merge from 'lodash.merge';
import {
  LOAD_MESSAGE_SUCCESS,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_MESSAGES_SUCCESS,
} from '../constants';

export default function messageById(state = {}, action) {
  switch (action.type) {
    case LOAD_MESSAGE_SUCCESS:
    case LOAD_MESSAGES_SUCCESS:
    case LOAD_NOTIFICATIONS_SUCCESS:
      return action.payload.entities.messages
        ? merge({}, state, action.payload.entities.messages)
        : state;

    default:
      return state;
  }
}
export const getEntity = (state, id) => state[id];
