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
mutation($message:MessageInput){
  notify(message:$message)
}`;

export const messageFields = `
id
sender{
  ${userFields}
}
message
messageHtml
subject
`;

const messageQuery = `
query($id:ID!) {
  message(id:$id){
    ${messageFields}
  }
}
`;

export function notifyUser(message) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['message']);
    dispatch({
      type: SEND_MESSAGE_START,
      id: message.recipients[0],
      properties,
    });

    try {
      const { data } = await graphqlRequest(notify, { message });

      if (!data.notify) {
        throw Error('Message failed');
      }
      dispatch({
        type: SEND_MESSAGE_SUCCESS,
        id: message.recipients[0],
        properties,
      });
    } catch (error) {
      dispatch({
        type: SEND_MESSAGE_ERROR,
        payload: {
          error,
        },
        id: message.recipients[0],
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
