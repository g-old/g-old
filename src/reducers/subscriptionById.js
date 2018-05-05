import {
  LOAD_SUBSCRIPTIONS_SUCCESS,
  CREATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_DISCUSSION_SUCCESS,
} from '../constants';

export default function byId(state = {}, action) {
  switch (action.type) {
    case LOAD_SUBSCRIPTIONS_SUCCESS:
    case UPDATE_SUBSCRIPTION_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_DISCUSSION_SUCCESS:
    case CREATE_SUBSCRIPTION_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.subscriptions,
      };
    }

    default:
      return state;
  }
}

export const getEntity = (state, id) => state[id];
