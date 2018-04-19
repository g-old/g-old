import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import MessageInput from '../types/MessageInputType';
import { canAccess } from '../../organization';
import { EmailType } from '../../core/BackgroundService';
import { sendJob } from '../../core/childProcess';
import User from '../models/User';

const sendMessage = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    message: {
      type: MessageInput,
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    switch (message.type) {
      case 'email': {
        // eslint-disable-next-line no-bitwise
        if (!canAccess(viewer, 'MessagePanel')) return false;
        if (!message.receiverId || !message.message) return false;

        const receiver = await User.gen(viewer, message.receiverId, loaders);

        const msg = JSON.parse(message.message);

        if (!receiver) return false;

        const job = {
          type: 'mail',
          data: {
            mailType: EmailType.MESSAGE,
            message: msg.msg,
            subject: message.subject || 'Info from GOLD',
            recipient: receiver,
            viewer,
          },
        };
        return sendJob(job);
      }
      case 'message': {
        // eslint-disable-next-line no-bitwise
        if (!viewer) return false;
        if (!message.receiver || !message.message) return false;

        const job = {
          type: 'message',
          data: {
            receiver: message.receiver,
            viewer,
            messageType: 'msg', // TODO not hardcode
            ...JSON.parse(message.message),
          },
        };
        return sendJob(job);
      }

      default:
        throw Error(`Message type not recognized: ${message.type}`);
    }
  },
};

export default sendMessage;
