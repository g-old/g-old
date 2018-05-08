import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './notificationById';
import {
  notificationList as notificationListSchema,
  notification as notificationSchema,
} from './../store/schema';

import {
  LOAD_NOTIFICATIONS_START,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_NOTIFICATIONS_ERROR,
} from '../constants';

const handlePageInfo = (state = {}, action) => {
  if (state.endCursor && !action.savePageInfo) {
    return state;
  }
  return { ...state, ...action.pagination };
};

const initialState = { ids: [] };

const status = (
  state = { pending: false, success: false, error: null },
  action,
) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS_START: {
      return {
        pending: true,
        error: null,
        success: false,
      };
    }
    case LOAD_NOTIFICATIONS_SUCCESS: {
      return {
        pending: false,
        error: null,
        success: true,
      };
    }
    case LOAD_NOTIFICATIONS_ERROR:
      return {
        pending: false,
        error: action.message,
        success: false,
      };

    default:
      return state;
  }
};

const all = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS_SUCCESS: {
      if (action.payload.entities.notifications) {
        if (action.newQuery) {
          return { ...state, ids: action.payload.result };
        }
        return {
          ...state,
          ids: [...new Set([...action.payload.result, ...state.ids])],
        };
      }
      return state;
    }

    default:
      return state;
  }
};

const pageInfo = (state = { endCursor: '', hasNextPage: false }, action) => {
  /* if (action.filter !== filter) {
     return state;
   } */
  switch (action.type) {
    case LOAD_NOTIFICATIONS_SUCCESS:
      return handlePageInfo(state, action);

    default:
      return state;
  }
};

export default combineReducers({
  byId,
  all,
  pageInfo,
  status,
});

const hydrateList = (state, data, entities) =>
  denormalize(
    { notifications: data },
    { notifications: notificationListSchema },
    {
      ...entities,
      notifications: state.byId,
      activities: entities.activities.byId,
      users: entities.users.byId,
      statements: entities.statements.byId,
      proposals: entities.proposals.byId,
      comments: entities.comments.byId,
      discussions: entities.discussions.byId,
      messages: entities.messages.byId,
    },
  );

export const getStatus = state => ({
  error: state.status.error,
  pending: state.status.pending,
  pageInfo: state.pageInfo,
});
const hydrateEntity = (data, entities) =>
  denormalize(data, notificationSchema, entities);

export const getEntity = (state, id, entities) => {
  const notification = fromById.getEntity(state.byId, id);
  return hydrateEntity(notification, entities);
};

export const getAll = (state, entities) => {
  const { ids } = state.all;
  return hydrateList(state, ids, entities).notifications;
};
