import { GraphQLID } from 'graphql';

import MessageType from '../types/MessageType';
import Message from '../models/Message';

const message = {
  type: MessageType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Message.gen(viewer, id, loaders),
};

export default message;
