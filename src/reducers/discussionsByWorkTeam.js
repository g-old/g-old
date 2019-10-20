import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
} from '../constants';

import { sortByWorkTeam } from './reducerUtils';

const byWorkTeam = (state = {}, action) => {
  switch (action.type) {
    case LOAD_DISCUSSION_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LOAD_DISCUSSIONS_SUCCESS: {
      const { discussions } = action.payload.entities;
      if (!discussions) return state;
      return sortByWorkTeam(state, discussions, 'workteamId');
    }

    default: {
      return state;
    }
  }
};
export default byWorkTeam;

export const getIds = (state, id) => (state[id] ? state[id] : []);
