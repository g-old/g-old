/* eslint-disable import/prefer-default-export */

import {
  SEND_MESSAGE_START,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_ERROR,
} from '../constants';
import { genStatusIndicators } from '../core/helpers';

const notify = `
mutation($message:String! $receiverId:ID! $type:Transport! $subject:String $receiver:ReceiverInput){
  notify (message: {message:$message receiverId:$receiverId type:$type subject:$subject receiver:$receiver})
}`;

export function notifyUser(messageData) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['message']);
    dispatch({
      type: SEND_MESSAGE_START,
      id: messageData.receiverId,
      properties,
    });

    try {
      const { data } = await graphqlRequest(notify, messageData);

      if (!data.notify) {
        throw Error('Message failed');
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        id: messageData.receiverId,
        properties,
      });
    } catch (error) {
      dispatch({
        type: SEND_MESSAGE_ERROR,
        payload: {
          error,
        },
        id: messageData.receiverId,
        properties,
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
