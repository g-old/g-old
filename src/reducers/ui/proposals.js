import { LOAD_PROPOSAL_SUCCESS, LOAD_PROPOSAL_START, LOAD_PROPOSAL_ERROR } from '../../constants';

const proposals = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_START:
      // const errorMessage = errorMessage(state[action.payload.is], action);
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: true,
          errorMessage: null,
        },
      };
    case LOAD_PROPOSAL_SUCCESS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: false,
          errorMessage: null,
        },
      };

    case LOAD_PROPOSAL_ERROR:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isFetching: false,
          errorMessage: action.message,
        },
      };
    default:
      return state;
  }
};

export default proposals;
export const getProposal = (state, id) => state[id] || {};
