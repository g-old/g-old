import {
  LOAD_MESSAGE_SUCCESS,
  LOAD_MESSAGES_SUCCESS,
  CREATE_MESSAGE_SUCCESS,
} from '../constants';

const sort = (state, messages) =>
  Object.keys(messages).reduce((acc, curr) => {
    const message = messages[curr];

    if (message.parentId) {
      acc[message.parentId] = [...new Set([curr, ...acc[message.parentId]])];
    } else if (acc[message.id]) {
      // is parent
      acc[message.id] = [...new Set([curr, ...acc[message.id]])];
    } else {
      acc[message.id] = [message.id];
    }

    return acc;
  }, state);

const byChannel = (state = {}, action) => {
  switch (action.type) {
    case LOAD_MESSAGE_SUCCESS:
    case CREATE_MESSAGE_SUCCESS:
    case LOAD_MESSAGES_SUCCESS: {
      const { messages } = action.payload.entities;
      if (!messages) return state;
      const sorted = sort(state, messages);
      return { ...sorted };
    }

    default: {
      return state;
    }
  }
};
export default byChannel;

export const getIds = (state, id) => (state[id] ? state[id] : []);
