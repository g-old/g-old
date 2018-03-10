import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_FEED_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
  SSE_UPDATE_SUCCESS,
  LOAD_GROUP_SUCCESS,
  JOIN_GROUP_SUCCESS,
} from '../constants';

export default function pollingModes(state = {}, action) {
  switch (action.type) {
    case LOAD_FEED_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case UPDATE_PROPOSAL_SUCCESS:
    case JOIN_GROUP_SUCCESS:
    case LOAD_GROUP_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.pollingModes);
    }
    case SSE_UPDATE_SUCCESS: {
      return action.payload.entities.pollingModes
        ? merge({}, state, action.payload.entities.pollingModes)
        : state;
    }
    default:
      return state;
  }
}
