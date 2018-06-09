import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import MessageInput from '../types/MessageInputType';
import Message from '../models/Message';
import Note from '../models/Note';

const createMessage = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    message: {
      type: MessageInput,
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    if (message.isDraft) {
      let messageObject;
      switch (message.messageType) {
        case 'note':
          if (message.note.id) {
            messageObject = Note.update(viewer, { ...message.note }, loaders);
          } else {
            messageObject = Note.create(
              viewer,
              { ...message.note, isPublished: false },
              loaders,
            );
          }
          break;

        default:
          throw new Error(
            `MessageType not implemented: ${message.messageType}`,
          );
      }

      return !!messageObject;
    }
    const newMessage = await Message.create(viewer, message, loaders);

    if (!newMessage) return null;

    return true; // TODO return message
  },
};

export default createMessage;
