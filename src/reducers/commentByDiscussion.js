import { LOAD_REPLIES_SUCCESS } from '../constants';

const sort = (state, discussions) =>
  Object.keys(discussions).reduce((acc, curr) => {
    const discussion = discussions[curr];
    if (!discussion.workTeamId) return acc;
    acc[discussion.workTeamId] = [
      ...new Set([curr, ...acc[discussion.workTeamId]]),
    ];

    return acc;
  }, state);

const byDiscussion = (state = {}, action) => {
  switch (action.type) {
    case LOAD_REPLIES_SUCCESS: {
      const comments = action.payload.entities.comments;
      if (!comments) return state;
      const sorted = sort(state, comments);
      return {
        ...sorted,
      };
    }

    default: {
      return state;
    }
  }
};
export default byDiscussion;

export const getIds = (state, id) => (state[id] ? state[id] : []);
