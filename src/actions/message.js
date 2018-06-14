/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_MESSAGE_START,
  CREATE_MESSAGE_SUCCESS,
  CREATE_MESSAGE_ERROR,
  LOAD_MESSAGE_START,
  LOAD_MESSAGE_SUCCESS,
  LOAD_MESSAGE_ERROR,
  LOAD_MESSAGES_START,
  LOAD_MESSAGES_ERROR,
  LOAD_MESSAGES_SUCCESS,
} from '../constants';
import { genStatusIndicators, depaginate } from '../core/helpers';
import {
  message as messageSchema,
  messageList as messageListSchema,
} from '../store/schema';
import { userFields } from './user';

const createMessageMutation = `
mutation($message:MessageInput){
  createMessage(message:$message){
    id
     sender{
  ${userFields}
  }
  subject
    parentId
    createdAt,
    messageType,
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
  }
}`;

export const messageFields = `
id
parentId,
createdAt
parents{
  id
  parentId
  sender{
  ${userFields}
  }
  subject
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
  createdAt
}
replies{
  id
  sender{
  ${userFields}
  }
  parentId
  subject
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
  createdAt
}
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

const messageConnection = `
query ($first:Int $after:String $userId:ID,$messageType:MessageTypeEnum, $isPublished:Boolean) {
  messageConnection (first:$first after:$after userId:$userId messageType:$messageType, isPublished:$isPublished) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
        id
        messageType
        messageObject{
        ... on Note{
              id
              textHtml{
                it
                de
              }
              content
              keyword
              category
              createdAt
              updatedAt
              isPublished
          }
         ... on Communication{
               id
               content
              replyable
          }
        }
      }
    }
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
      const normalizedData = normalize(data.createMessage, messageSchema);
      dispatch({
        type: CREATE_MESSAGE_SUCCESS,
        id: message.recipients[0],
        properties,
        payload: normalizedData,
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

export function loadMessages(args) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_MESSAGES_START,
    });

    try {
      const { data } = await graphqlRequest(messageConnection, args);
      const depaginated = depaginate('message', data);
      const normalizedData = normalize(depaginated.messages, messageListSchema);
      dispatch({
        type: LOAD_MESSAGES_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_MESSAGES_ERROR,
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
