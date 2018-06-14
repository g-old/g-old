import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './messageById';
import byChannel, * as fromByChannel from './messagesByChannel';

import {
  message as messageSchema,
  messageList as messageListSchema,
} from './../store/schema';

import {
  LOAD_MESSAGES_START,
  LOAD_MESSAGES_SUCCESS,
  LOAD_MESSAGES_ERROR,
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
    case LOAD_MESSAGES_START: {
      return {
        pending: true,
        error: null,
        success: false,
      };
    }
    case LOAD_MESSAGES_SUCCESS: {
      return {
        pending: false,
        error: null,
        success: true,
      };
    }
    case LOAD_MESSAGES_ERROR:
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
    case LOAD_MESSAGES_SUCCESS: {
      if (action.payload.entities.messages) {
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
    case LOAD_MESSAGES_SUCCESS:
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
  byChannel,
});

const hydrateList = (state, data, entities) =>
  denormalize(
    { messages: data },
    { messages: messageListSchema },
    {
      ...entities,
      messages: state.byId,
      activities: entities.activities.byId,
      users: entities.users.byId,
      statements: entities.statements.byId,
      proposals: entities.proposals.byId,
      comments: entities.comments.byId,
      discussions: entities.discussions.byId,
      workTeams: entities.workTeams.byId,
    },
  );

export const getStatus = state => ({
  error: state.all.errorMessage,
  pending: state.all.pending,
});
const hydrateEntity = (data, entities) =>
  denormalize(data, messageSchema, {
    users: entities.users.byId,
    messages: entities.messages.byId,
    workTeams: entities.workTeams.byId,
  });

export const getEntity = (state, id, entities) => {
  const message = fromById.getEntity(state.byId, id);
  return hydrateEntity(message, entities);
};

export const getByChannel = (state, channelId, entities) => {
  const ids = fromByChannel.getIds(state.byChannel, channelId);
  return hydrateList(state, ids, entities).messages;
};

export const getAll = (state, entities) => {
  const { ids } = state.all;
  return hydrateList(state, ids, entities).messages;
};
