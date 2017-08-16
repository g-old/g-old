import { combineReducers } from 'redux';
import {
  LOAD_WORKTEAMS_START,
  LOAD_WORKTEAMS_SUCCESS,
  LOAD_WORKTEAMS_ERROR,
  CREATE_WORKTEAM_SUCCESS,
} from '../constants';

const ids = (state = [], action) => {
  switch (action.type) {
    case LOAD_WORKTEAMS_SUCCESS: {
      return [...action.payload.result];
    }
    case CREATE_WORKTEAM_SUCCESS: {
      return [...state, action.payload.result];
    }
    default:
      return state;
  }
};
const isFetching = (state = false, action) => {
  switch (action.type) {
    case LOAD_WORKTEAMS_START:
      return true;
    case LOAD_WORKTEAMS_SUCCESS:
    case LOAD_WORKTEAMS_ERROR:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case LOAD_WORKTEAMS_ERROR:
      return action.message;
    case LOAD_WORKTEAMS_START:
    case LOAD_WORKTEAMS_SUCCESS:
      return null;

    default:
      return state;
  }
};

const workTeamsList = combineReducers({
  ids,
  isFetching,
  errorMessage,
});

export default workTeamsList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
