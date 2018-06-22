import { combineReducers } from 'redux';
import {
  LOAD_DISCUSSION_SUCCESS,
  LOAD_DISCUSSIONS_SUCCESS,
  LOAD_DISCUSSIONS_START,
  LOAD_DISCUSSIONS_ERROR,
  LOAD_WORKTEAM_SUCCESS,
} from '../constants';

import createPageInfo from './createPageInfo';

const createReducer = filter => {
  const ids = (state = [], action) => {
    switch (action.type) {
      case LOAD_DISCUSSIONS_SUCCESS:
      case LOAD_WORKTEAM_SUCCESS: {
        if (action.payload.entities.discussions) {
          if (action.filter === filter) {
            return [
              ...new Set([
                ...state,
                ...Object.keys(action.payload.entities.discussions),
              ]),
            ];
          }
        }
        return state;
      }
      case LOAD_DISCUSSION_SUCCESS: {
        const discussion =
          action.payload.entities.discussions[action.payload.result];

        if (filter !== 'active') {
          if (discussion.closedAt) {
            return [...new Set([...state, discussion.id])];
          }
        } else if (!discussion.closedAt) {
          return [...new Set([...state, discussion.id])];
        }
        return state;
      }

      default:
        return state;
    }
  };
  const isFetching = (state = false, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_DISCUSSIONS_START:
        return true;
      case LOAD_DISCUSSIONS_SUCCESS:
      case LOAD_DISCUSSIONS_ERROR:
        return false;
      default:
        return state;
    }
  };

  const errorMessage = (state = null, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_DISCUSSIONS_ERROR:
        return action.message;
      case LOAD_DISCUSSIONS_START:
      case LOAD_DISCUSSIONS_SUCCESS:
        return null;

      default:
        return state;
    }
  };
  const pageInfo = createPageInfo(LOAD_DISCUSSIONS_SUCCESS, filter);

  return combineReducers({ ids, pageInfo, isFetching, errorMessage });
};

const byState = combineReducers({
  active: createReducer('active'),
  closed: createReducer('closed'),
});
export default byState;

export const getPageInfo = state => ({
  pagination: state.pageInfo,
  pending: state.isFetching,
  error: state.errorMessage,
});

export const getIds = (state, filter) =>
  state[filter] ? state[filter].ids : [];
