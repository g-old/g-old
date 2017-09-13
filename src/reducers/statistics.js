import merge from 'lodash.merge';
import { LOAD_STATISTICS_SUCCESS } from '../constants';

export default function statistics(state = {}, action) {
  switch (action.type) {
    case LOAD_STATISTICS_SUCCESS:
      return action.payload ? merge({}, state, action.payload) : state;

    default:
      return state;
  }
}
