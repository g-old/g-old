import { normalize } from 'normalizr';
import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_START,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_ERROR,
} from '../constants';

import { proposal as proposalSchema } from '../store/schema';

export default function proposal(state = { proposals: {} }, action) {
  switch (action.type) {
    case LOAD_PROPOSAL_START: {
    //  TODO insert id with isFetching set to true - change success and error accordingly
      return {
        ...state,
      };
    }

    case LOAD_PROPOSAL_SUCCESS: {
      const normalizedData = normalize(action.payload.proposalDL, proposalSchema);

      return {
        ...merge({}, state, normalizedData.entities),

      };
    }

    case LOAD_PROPOSAL_ERROR: {
      return {
        ...state,
      };
    }

    default: {
      return state;
    }
  }
}
