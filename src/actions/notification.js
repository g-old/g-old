/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_NOTIFICATION_START,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_ERROR,
  UPDATE_NOTIFICATION_START,
  UPDATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_ERROR,
  DELETE_NOTIFICATION_START,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_ERROR,
  LOAD_NOTIFICATIONS_START,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_NOTIFICATIONS_ERROR,
} from '../constants';
import {
  notification as notificationSchema,
  notificationList as notificationListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';
import { pollFieldsForList } from './proposal';

const userFields = `
id
name
surname
thumbnail`;

const notificationFields = `
      id
      activity{
        id
        object{
           __typename
          ...on StatementDL{
            id
            pollId
            position
            text
          }
          ...on ProposalDL{
            id
            title
            pollOne{
              ${pollFieldsForList}
            }
            pollTwo{
              ${pollFieldsForList}
            }
          }
        }
        info
        type
        actor{
          ${userFields}
        }
        verb
      }
      read
      createdAt

`;

const createNotificationMutation = `
  mutation ($notification:NotificationInput) {
    createNotification (notification:$notification){
      ${notificationFields}
    }
  }
`;

const updateNotificationMutation = `
  mutation ($notification:NotificationInput) {
    updateNotification (notification:$notification){
      ${notificationFields}
    }
  }
`;

const deleteNotificationMutation = `
  mutation ($notification:NotificationInput) {
    deleteNotification (notification:$notification){
      ${notificationFields}
    }
  }
`;

const notificationConnection = `
query ($first:Int $after:String $userId:ID) {
  notificationConnection (first:$first after:$after userId:$userId) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
    ${notificationFields}
      }
    }
  }
}
`;

export function createNotification(notification) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    const properties = genStatusIndicators(['createNotification']);
    dispatch({
      type: CREATE_NOTIFICATION_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createNotificationMutation, {
        notification,
      });
      const normalizedData = normalize(
        data.createNotification,
        notificationSchema,
      );
      dispatch({
        type: CREATE_NOTIFICATION_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
        notification,
      });
    } catch (error) {
      dispatch({
        type: CREATE_NOTIFICATION_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        notification,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updateNotification(notification) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updatenotification']);
    dispatch({
      type: UPDATE_NOTIFICATION_START,
      id: notification.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateNotificationMutation, {
        notification,
      });
      const normalizedData = normalize(
        data.updateNotification,
        notificationSchema,
      );
      dispatch({
        type: UPDATE_NOTIFICATION_SUCCESS,
        payload: normalizedData,
        properties,
        id: notification.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_NOTIFICATION_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: notification.id,
        notification,
      });
      return false;
    }

    return true;
  };
}

export function deleteNotification(notification) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteNotification']);
    dispatch({
      type: DELETE_NOTIFICATION_START,
      id: notification.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteNotificationMutation, {
        notification,
      });
      const normalizedData = normalize(
        data.deleteNotification,
        notificationSchema,
      );
      dispatch({
        type: DELETE_NOTIFICATION_SUCCESS,
        payload: normalizedData,
        properties,
        id: notification.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_NOTIFICATION_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: notification.id,
        properties,
        notification: { delete: true },
      });
      return false;
    }

    return true;
  };
}

export function loadNotificationList({ first, after, userId }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_NOTIFICATIONS_START,
    });

    try {
      const { data } = await graphqlRequest(notificationConnection, {
        first,
        after,
        userId,
      });
      const notifications = data.notificationConnection.edges.map(u => u.node);
      const normalizedData = normalize(notifications, notificationListSchema);
      dispatch({
        type: LOAD_NOTIFICATIONS_SUCCESS,
        payload: normalizedData,
        pagination: data.notificationConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_NOTIFICATIONS_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
