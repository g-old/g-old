/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  SEND_MESSAGE_START,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_ERROR,
  LOAD_MESSAGE_START,
  LOAD_MESSAGE_SUCCESS,
  LOAD_MESSAGE_ERROR,
} from '../constants';
import { genStatusIndicators } from '../core/helpers';
import { message as messageSchema } from '../store/schema';
import { userFields } from './user';

const notify = `
mutation($message:String! $receiverId:ID! $type:Transport! $subject:String $receiver:ReceiverInput){
  notify (message: {message:$message receiverId:$receiverId type:$type subject:$subject receiver:$receiver})
}`;

export const messageFields = `
id
sender{
  ${userFields}
}
msg
title
`;

const messageQuery = `
query($id:ID!) {
  message(id:$id){
    ${messageFields}
  }
}
`;

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

export function loadMessage(id) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_MESSAGE_START,
    });

    try {
      const { data } = await graphqlRequest(messageQuery, { id });
      const normalizedData = normalize(data.message, messageSchema);
      dispatch({
        type: LOAD_MESSAGE_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_MESSAGE_ERROR,
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
