import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_FEED_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
  SSE_UPDATE_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  JOIN_WORKTEAM_SUCCESS,
  LOAD_NOTIFICATIONS_SUCCESS,
  CREATE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTION_SUCCESS,
} from '../constants';

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
    case LOAD_NOTIFICATIONS_SUCCESS:
    case JOIN_WORKTEAM_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }
    case LOAD_PROPOSAL_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      // change
      return merge({}, state, action.payload.entities.proposals);
    }

    case SSE_UPDATE_SUCCESS: {
      // eslint-disable-next-line
      const proposals = action.payload.entities.proposals;
      if (!proposals) return state;
      return merge({}, state, action.payload.entities.proposals);
    }

    case CREATE_PROPOSAL_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }
    case UPDATE_PROPOSAL_SUCCESS: {
      return merge({}, state, action.payload.entities.proposals);
    }

    case CREATE_SUBSCRIPTION_SUCCESS: {
      const sub = action.payload.entities.subscriptions[action.payload.result];
      if (sub.targetType === 'PROPOSAL') {
        return {
          ...state,
          [sub.targetId]: { ...state[sub.targetId], subscription: sub.id },
        };
      }
      return state;
    }
    case DELETE_SUBSCRIPTION_SUCCESS: {
      const sub = action.payload.entities.subscriptions[action.payload.result];
      if (sub.targetType === 'PROPOSAL') {
        return {
          ...state,
          [sub.targetId]: { ...state[sub.targetId], subscription: null },
        };
      }
      return state;
    }
    default:
      return state;
  }
}

export const getProposal = (state, id) => state[id] || {};
