import { combineReducers } from 'redux';
import {
  LOAD_PROPOSAL_LIST_START,
  LOAD_PROPOSAL_LIST_ERROR,
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
  SSE_UPDATE_SUCCESS,
} from '../constants';

const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return { ...state, ...action.pagination };
};

const createList = filter => {
  const handleStateChange = (state, action) => {
    const { state: updatedState, id } = action.payload.entities.proposals[
      action.payload.result
    ];
    return updatedState === filter
      ? [...new Set([...state, id])]
      : state.filter(pId => pId !== id);
  };
  const ids = (state = [], action) => {
    switch (action.type) {
      case CREATE_PROPOSAL_SUCCESS:
      case LOAD_PROPOSAL_SUCCESS: {
        return filter === action.filter
          ? [...new Set([...state, action.payload.result])]
          : state;
      }
      case SSE_UPDATE_SUCCESS: {
        const activity =
          action.payload.entities.activities[action.payload.result];
        if (!activity.type === 'proposal') {
          return state;
        }
        return filter === action.filter
          ? [...new Set([activity.objectId, ...state])]
          : state;
      }
      case UPDATE_PROPOSAL_SUCCESS: {
        return handleStateChange(state, action);
      }
      case LOAD_PROPOSAL_LIST_SUCCESS: {
        return filter === action.filter
          ? [...new Set([...state, ...(action.payload.result || [])])]
          : state;
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
      case LOAD_PROPOSAL_LIST_START:
        return true;
      case LOAD_PROPOSAL_LIST_SUCCESS:
      case LOAD_PROPOSAL_LIST_ERROR:
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
      case LOAD_PROPOSAL_LIST_ERROR:
        return action.message;
      case LOAD_PROPOSAL_LIST_START:
      case LOAD_PROPOSAL_LIST_SUCCESS:
        return null;

      default:
        return state;
    }
  };
  const pageInfo = (state = { endCursor: '' }, action) => {
    if (action.filter !== filter) {
      return state;
    }
    switch (action.type) {
      case LOAD_PROPOSAL_LIST_SUCCESS:
        return handlePageInfo(state, action);

      default:
        return state;
    }
  };
  return combineReducers({
    ids,
    isFetching,
    errorMessage,
    pageInfo,
  });
};

export default createList;
export const getIds = state => state.ids;
export const getIsFetching = state => state.isFetching;
export const getErrorMessage = state => state.errorMessage;
export const getPageInfo = state => state.pageInfo;
