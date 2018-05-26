/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_MESSAGE_START,
  CREATE_MESSAGE_SUCCESS,
  CREATE_MESSAGE_ERROR,
  LOAD_MESSAGE_START,
  LOAD_MESSAGE_SUCCESS,
  LOAD_MESSAGE_ERROR,
} from '../constants';
import { genStatusIndicators } from '../core/helpers';
import { message as messageSchema } from '../store/schema';
import { userFields } from './user';

const createMessageMutation = `
mutation($message:MessageInput){
  createMessage(message:$message)
}`;

export const messageFields = `
id
sender{
  ${userFields}
}
messageType
messageObject{
  ... on Note{
    id
    content
  }
  ... on Communication{
    id
    content
    replyable
  }
}
subject
`;

const messageQuery = `
query($id:ID!) {
  message(id:$id){
    ${messageFields}
  }
}
`;

export function createMessage(message) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['message']);
    dispatch({
      type: CREATE_MESSAGE_START,
      id: message.recipients[0],
      properties,
    });

    try {
      const { data } = await graphqlRequest(createMessageMutation, { message });

      if (!data.createMessage) {
        throw Error('Message failed');
      }
      dispatch({
        type: CREATE_MESSAGE_SUCCESS,
        id: message.recipients[0],
        properties,
      });
    } catch (error) {
      dispatch({
        type: CREATE_MESSAGE_ERROR,
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
