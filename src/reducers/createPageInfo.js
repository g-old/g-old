const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return { ...state, ...action.pagination };
};

const createPageInfo = (actionType, filter) => (
  state = { endCursor: '' },
  action,
) => {
  if (action.filter !== filter) {
    return state;
  }
  switch (action.type) {
    case actionType:
      return handlePageInfo(state, action);

    default:
      return state;
  }
};

export default createPageInfo;
