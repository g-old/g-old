import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import MessageInput from '../types/MessageInputType';
import Message from '../models/Message';

const sendMessage = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    message: {
      type: MessageInput,
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    const newMessage = await Message.create(viewer, message, loaders);

    if (!newMessage) return null;

    return true; // TODO return message
  },
};

export default sendMessage;
