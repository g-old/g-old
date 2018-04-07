import merge from 'lodash.merge';
import { LOAD_FEED_SUCCESS } from '../constants';

export default function votes(state = {}, action) {
  switch (action.type) {
    case LOAD_FEED_SUCCESS:
      return action.payload.entities.messages
        ? merge({}, state, action.payload.entities.messages)
        : state;

    default:
      return state;
  }
}
