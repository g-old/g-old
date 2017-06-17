import {
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_START,
  LOAD_PROPOSAL_ERROR,
  CREATE_PROPOSAL_START,
  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_ERROR,
  UPDATE_PROPOSAL_START,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_ERROR,
} from '../../constants';

const proposals = (state = {}, action) => {
  switch (action.type) {
    case CREATE_PROPOSAL_START:
    case LOAD_PROPOSAL_START:
    case UPDATE_PROPOSAL_START:
      // const errorMessage = errorMessage(state[action.payload.is], action);
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: true,
          errorMessage: null,
          success: false,
        },
      };
    case CREATE_PROPOSAL_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case UPDATE_PROPOSAL_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: false,
          errorMessage: null,
          success: true,
        },
      };
    case CREATE_PROPOSAL_ERROR:
    case LOAD_PROPOSAL_ERROR:
    case UPDATE_PROPOSAL_ERROR:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: false,
          errorMessage: action.message,
          success: false,
        },
      };
    default:
      return state;
  }
};

export default proposals;
export const getProposal = (state, id) => state[id] || {};
