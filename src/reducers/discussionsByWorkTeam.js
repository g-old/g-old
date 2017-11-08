import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
} from '../constants';

const sort = (state, discussions) =>
  Object.keys(discussions).reduce((acc, curr) => {
    const discussion = discussions[curr];
    if (!discussion.workTeamId) return acc;
    acc[discussion.workTeamId] = [
      ...new Set([curr, ...acc[discussion.workTeamId]]),
    ];

    return acc;
  }, state);

const byWorkTeam = (state = {}, action) => {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS: {
      const proposals = action.payload.entities.proposals;
      if (!proposals) return state;
      const sorted = sort(state, proposals);
      return {
        ...sorted,
      };
    }

    default: {
      return state;
    }
  }
};
export default byWorkTeam;

export const getIds = (state, id) => (state[id] ? state[id] : []);
