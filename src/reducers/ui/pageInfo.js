import { LOAD_PROPOSAL_LIST_SUCCESS } from '../../constants';

const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return {
    ...state,
    [action.pageIndex]: {
      ...action.pagination,
    },
  };
};

const pageInfo = (state = { endCursor: '' }, action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_LIST_SUCCESS:
      return handlePageInfo(state, action);

    default:
      return state;
  }
};

export default pageInfo;
export const getPageInfo = (state, queryStateTag) => state[queryStateTag] || {};
