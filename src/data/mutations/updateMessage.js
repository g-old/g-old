import { GraphQLNonNull } from 'graphql';
import MessageInput from '../types/MessageInputType';
import MessageType from '../types/MessageType';
import Message from '../models/Message';
import Note from '../models/Note';

const updateMessage = {
  type: new GraphQLNonNull(MessageType),
  args: {
    message: {
      type: MessageInput,
      description: 'Update message',
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    if (message.isDraft) {
      let messageObject;
      switch (message.messageType) {
        case 'note':
          if (message.note.id) {
            messageObject = await Note.update(
              viewer,
              { ...message.note },
              loaders,
            );
          }
          break;

        default:
          throw new Error(
            `MessageType not implemented: ${message.messageType}`,
          );
      }

      const msg = new Message({
        id: `mo${messageObject.id}`,
        sender_id: viewer.id,
        message_type: message.messageType,
        created_at: new Date(),
        message_object_id: messageObject.id,
      });
      return msg;
    }
    const updatedMessage = await Message.update(viewer, message, loaders);
    return updatedMessage;
  },
};

export default updateMessage;
