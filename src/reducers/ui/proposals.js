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
  CREATE_PROPOSALSUB_START,
  CREATE_PROPOSALSUB_SUCCESS,
  CREATE_PROPOSALSUB_ERROR,
  DELETE_PROPOSALSUB_START,
  DELETE_PROPOSALSUB_SUCCESS,
  DELETE_PROPOSALSUB_ERROR,
} from '../../constants';

const proposals = (state = {}, action) => {
  switch (action.type) {
    case CREATE_PROPOSAL_START:
    case LOAD_PROPOSAL_START:
    case UPDATE_PROPOSAL_START:
    case CREATE_PROPOSALSUB_START:
    case DELETE_PROPOSALSUB_START:
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
    case CREATE_PROPOSALSUB_SUCCESS:
    case DELETE_PROPOSALSUB_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: false,
          errorMessage: null,
          success: action.info || true, // to get id of created proposal
        },
      };
    case CREATE_PROPOSAL_ERROR:
    case LOAD_PROPOSAL_ERROR:
    case UPDATE_PROPOSAL_ERROR:
    case CREATE_PROPOSALSUB_ERROR:
    case DELETE_PROPOSALSUB_ERROR:
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
