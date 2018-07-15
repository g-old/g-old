import { GraphQLID, GraphQLBoolean } from 'graphql';

import MessageType from '../types/MessageType';
import Message from '../models/Message';

const message = {
  type: MessageType,
  args: {
    id: {
      type: GraphQLID,
    },
    isMessageObject: {
      type: GraphQLBoolean,
    },
  },
  resolve: (parent, { id, isMessageObject }, { viewer, loaders }) => {
    if (!isMessageObject) {
      return Message.gen(viewer, id, loaders);
    }

    // TODO refactor later in own query
    const noteId = id.slice(2);

    return new Message({
      id,
      message_type: 'note',
      message_object_id: noteId,
      created_at: new Date(),
    });
  },
};

export default message;
