import merge from 'lodash.merge';
import { LOAD_PROPOSAL_LIST_SUCCESS, LOAD_PROPOSAL_SUCCESS } from '../constants';

export default function pollingModes(state = {}, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.pollingModes);
    }
    default:
      return state;
  }
}
