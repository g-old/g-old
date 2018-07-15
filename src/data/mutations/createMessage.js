import { GraphQLNonNull } from 'graphql';
import MessageInput from '../types/MessageInputType';
import Message from '../models/Message';
import MessageType from '../types/MessageType';
import Note from '../models/Note';
import log from '../../logger';

const createMessage = {
  type: new GraphQLNonNull(MessageType),
  args: {
    message: {
      type: MessageInput,
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    try {
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
            } else {
              messageObject = await Note.create(
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

        const newMessage = new Message({
          id: `mo${messageObject.id}`,
          sender_id: viewer.id,
          created_at: new Date(),
          message_object_id: messageObject.id,
        });
        return newMessage;
      }
      const newMessage = await Message.create(viewer, message, loaders);

      if (!newMessage) return null;

      return newMessage; // TODO return message
    } catch (err) {
      log.error({ err, viewer, message }, 'Message creation failed');
      return false;
    }
  },
};

export default createMessage;
