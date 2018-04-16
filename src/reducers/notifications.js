import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './notificationById';
import {
  notificationList as notificationListSchema,
  notification as notificationSchema,
} from './../store/schema';

import { LOAD_NOTIFICATIONS_SUCCESS } from '../constants';

const initialState = { ids: [] };
const all = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS_SUCCESS: {
      return action.payload.entities.notifications
        ? {
            ...state,
            ids: [
              ...new Set(
                Object.keys(action.payload.entities.notifications).reverse(),
              ),
            ],
          }
        : state;
    }

    default:
      return state;
  }
};

export default combineReducers({
  byId,
  all,
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
    },
  );

export const getStatus = state => ({
  error: state.all.errorMessage,
  pending: state.all.pending,
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
