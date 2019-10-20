import {
  LOAD_PROPOSAL_SUCCESS,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
} from '../constants';

import { sortByWorkTeam } from './reducerUtils';

const byWorkTeam = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      const { proposals } = action.payload.entities;
      if (!proposals) return state;
      return sortByWorkTeam(state, proposals, 'workteamId');
    }

    default: {
      return state;
    }
  }
};
export default byWorkTeam;

export const getIds = (state, id) => (state[id] ? state[id] : []);
