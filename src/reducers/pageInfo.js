import { combineReducers } from 'redux';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_LIST_START,
  LOAD_PROPOSAL_LIST_ERROR,
  LOAD_USERS_START,
  LOAD_USERS_SUCCESS,
  LOAD_USERS_ERROR,
  LOAD_ACTIVITIES_START,
  LOAD_ACTIVITIES_SUCCESS,
  LOAD_ACTIVITIES_ERROR,
} from '../constants';

const handlePageInfo = (state, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return action.pagination;
};

const createPageInfo = types => {
  const [requestType, successType, failureType] = types;
  const updatePagination = (state = {}, action) => {
    switch (action.type) {
      case requestType: {
        return {
          ...state,

          errorMessage: null,
          isFetching: true,
          success: false,
        };
      }
      case successType: {
        return {
          pagination: handlePageInfo(state, action),
          isFetching: false,
          success: true,
          errorMessage: null,
          totalCount: action.totalCount,
        };
      }
      case failureType: {
        return {
          isFetching: false,
          success: false,
          errorMessage: action.message,
        };
      }
      default:
        return state;
    }
  };
  return (state = {}, action) => {
    switch (action.type) {
      case requestType:
      case successType:
      case failureType:
        return {
          ...state,
          [action.pageKey]: updatePagination(state[action.pageKey], action),
        };
      default:
        return state;
    }
  };
};

export default combineReducers({
  proposals: createPageInfo([
    LOAD_PROPOSAL_LIST_START,
    LOAD_PROPOSAL_LIST_SUCCESS,
    LOAD_PROPOSAL_LIST_ERROR,
  ]),

  users: createPageInfo([
    LOAD_USERS_START,
    LOAD_USERS_SUCCESS,
    LOAD_USERS_ERROR,
  ]),
  activities: createPageInfo([
    LOAD_ACTIVITIES_START,
    LOAD_ACTIVITIES_SUCCESS,
    LOAD_ACTIVITIES_ERROR,
  ]),
});

export const genProposalPageKey = ({
  state = 'state',
  workteamId = 'workteamId',
  closed = false,
  tagId = 'tagId',
}) => `${state}$${workteamId}$${closed}$${tagId}`;

export const genUsersPageKey = ({ union = false, group = 'group' }) =>
  `${group}$${union}`;

export const genActivityPageKey = () => `$activity$`;
export const getPageInfo = (state, resource, pageKey) => {
  const data = state[resource][pageKey] || {
    errorMessage: null,
    pending: false,
    pagination: {},
  };
  return {
    errorMessage: data.errorMessage,
    pending: data.isFetching,
    pagination: data.pagination || {},
    totalCount: data.totalCount,
  };
};
