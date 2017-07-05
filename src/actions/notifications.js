/* eslint-disable import/prefer-default-export */

import {
  SEND_NOTIFICATION_START,
  SEND_NOTIFICATION_SUCCESS,
  SEND_NOTIFICATION_ERROR,
} from '../constants';

const notification = `
mutation($message:String! $receiverId:ID! $type:Transport! $subject:String){
  notify(notification: {message:$message receiverId:$receiverId type:$type subject:$subject})
}`;

export function notifyUser(notificationData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: SEND_NOTIFICATION_START,
      id: notificationData.receiverId,
    });

    try {
      const { data } = await graphqlRequest(notification, notificationData);

      if (!data.notify) {
        throw Error('Notification failed');
      }
      dispatch({
        type: SEND_NOTIFICATION_SUCCESS,
      });
    } catch (error) {
      dispatch({
        type: SEND_NOTIFICATION_ERROR,
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
