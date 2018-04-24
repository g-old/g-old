import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import MessageInput from '../types/MessageInputType';
import Message from '../models/Message';
import Activity, { ActivityType, ActivityVerb } from '../models/Activity';
import { TargetType } from '../models/Subscription';

import knex from '../knex';

const sendMessage = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    message: {
      type: MessageInput,
    },
  },
  resolve: async (data, { message }, { viewer, loaders }) => {
    const msg = JSON.parse(message.message);
    const newMessage = await Message.create(
      viewer,
      {
        type: 'msg', // event or msg
        msg: msg.msg,
        title: message.subject,

        /* info: {
        targetType:
          receiver.type === 'team' ? TargetType.GROUP : TargetType.USER,
        targetId: receiver.id,
      }, */
      },
      loaders,
    );

    if (!newMessage) return null;
    const activity = await Activity.create(viewer, {
      verb: ActivityVerb.CREATE,
      type: ActivityType.MESSAGE,
      objectId: newMessage.id,
      content: {
        ...newMessage,
        targetType:
          message.receiver.type === 'team' ? TargetType.GROUP : TargetType.USER,
        targetId: message.receiver.id,
      },
    });
    if (!activity) {
      await knex('messages')
        .where({ id: newMessage.id })
        .del();
      return false;
    }
    return true; // TODO return message
    /*
    switch (message.type) {
      case 'email': {
        // eslint-disable-next-line no-bitwise
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
    } */
  },
};

export default sendMessage;
