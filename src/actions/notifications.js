/* eslint-disable import/prefer-default-export */

import {
  SEND_NOTIFICATION_START,
  SEND_NOTIFICATION_SUCCESS,
  SEND_NOTIFICATION_ERROR,
} from '../constants';
import { genStatusIndicators } from '../core/helpers';

const notify = `
mutation($message:String! $receiverId:ID! $type:Transport! $subject:String $receiver:ReceiverInput){
  notify(notification: {message:$message receiverId:$receiverId type:$type subject:$subject receiver:$receiver})
}`;

export function notifyUser(notificationData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['notification']);
    dispatch({
      type: SEND_NOTIFICATION_START,
      id: notificationData.receiverId,
      properties,
    });

    try {
      const { data } = await graphqlRequest(notify, notificationData);

      if (!data.notify) {
        throw Error('Notification failed');
      }
      dispatch({
        type: SEND_NOTIFICATION_SUCCESS,
        id: notificationData.receiverId,
        properties,
      });
    } catch (error) {
      dispatch({
        type: SEND_NOTIFICATION_ERROR,
        payload: {
          error,
        },
        id: notificationData.receiverId,
        properties,
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
