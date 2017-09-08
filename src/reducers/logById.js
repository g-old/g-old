import merge from 'lodash.merge';
import { LOAD_LOGS_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_LOGS_SUCCESS: {
      return action.payload.entities.logs
        ? merge({}, state, action.payload.entities.logs)
        : state;
    }
    default:
      return state;
  }
}

export const getLog = (state, id) => state[id];
