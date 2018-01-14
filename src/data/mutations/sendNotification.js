import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import NotificationInput from '../types/NotificationInputType';
import { canAccess } from '../../organization';

import { sendJob } from '../../core/childProcess';
import User from '../models/User';

const sendNotification = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    notification: {
      type: NotificationInput,
    },
  },
  resolve: async (data, { notification }, { viewer, loaders }) => {
    switch (notification.type) {
      case 'email': {
        // eslint-disable-next-line no-bitwise
        if (!canAccess(viewer, 'NotificationPanel')) return false;
        if (!notification.receiverId || !notification.message) return false;

        const receiver = await User.gen(
          viewer,
          notification.receiverId,
          loaders,
        );

        const msg = JSON.parse(notification.message);

        if (!receiver) return false;

        const job = {
          type: 'mail',
          data: {
            mailType: 'notification',
            message: msg.msg,
            subject: notification.subject || 'Info from GOLD',
            recipient: receiver,
            viewer,
          },
        };
        return sendJob(job);
      }
      case 'notification': {
        // eslint-disable-next-line no-bitwise
        if (!viewer) return false;
        if (!notification.receiver || !notification.message) return false;

        const job = {
          type: 'notification',
          data: {
            receiver: notification.receiver,
            viewer,
            notificationType: 'msg', // TODO not hardcode
            ...JSON.parse(notification.message),
          },
        };
        return sendJob(job);
      }

      default:
        throw Error(`Notification type not recognized: ${notification.type}`);
    }
  },
};

export default sendNotification;
