import {
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_LIST_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const sortTags = (state, proposals) =>
  Object.keys(proposals).reduce((acc, curr) => {
    const proposal = proposals[curr];
    if (!proposal.tags) return acc;
    proposal.tags.forEach(tagId => {
      if (tagId in acc) {
        acc[tagId] = [...new Set([curr, ...acc[tagId]])];
      } else {
        acc[tagId] = [curr];
      }
    });
    return acc;
  }, state);

const byTag = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_LIST_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS: {
      const proposals = action.payload.entities.proposals;
      if (!proposals) return state;
      const sorted = sortTags(state, proposals);
      return {
        ...sorted,
      };
    }
    case SSE_UPDATE_SUCCESS: {
      const proposals = action.payload.entities.proposals;
      if (!proposals) return state;
      const activity =
        action.payload.entities.activities[action.payload.result];

      if (activity.type === 'proposal' && activity.verb === 'create') {
        const sorted = sortTags(state, proposals);
        return {
          ...sorted,
        };
      }
      return state;
    }

    default: {
      return state;
    }
  }
};
export default byTag;

export const getIds = (state, id) => (state[id] ? state[id] : []);
