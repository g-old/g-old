import merge from 'lodash.merge';
import {
  LOAD_WORKTEAMS_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  CREATE_WORKTEAM_SUCCESS,
  FETCH_USER_SUCCESS,
  LEAVE_WORKTEAM_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
} from '../constants';

export default function workTeams(state = {}, action) {
  switch (action.type) {
    case LOAD_WORKTEAMS_SUCCESS:
    case FETCH_USER_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LEAVE_WORKTEAM_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
    case CREATE_WORKTEAM_SUCCESS: {
      return merge({}, state, action.payload.entities.workTeams);
    }

    default: {
      return state;
    }
  }
}

export const getWorkTeam = (state, id) => state[id] || {};
