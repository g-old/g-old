import merge from 'lodash.merge';
import { LOAD_PROPOSAL_LIST_SUCCESS, LOAD_PROPOSAL_SUCCESS, LOAD_FEED_SUCCESS } from '../constants';

export default function byId(state = {}, action) {
  /* if (action.payload.entities.proposals) {
    return {
      ...state,
      ...action.payload.entities.proposals,
    };
  } */
  switch (action.type) {
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }
    case LOAD_PROPOSAL_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      // change
      return merge({}, state, action.payload.entities.proposals);
    }
    default:
      return state;
  }
}

export const getProposal = (state, id) => state[id] || {};
