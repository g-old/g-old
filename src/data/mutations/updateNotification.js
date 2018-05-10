import { GraphQLNonNull } from 'graphql';
import NotificationInput from '../types/NotificationInputType';
import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';

const updateNotification = {
  type: new GraphQLNonNull(NotificationType),
  args: {
    notification: {
      type: NotificationInput,
      description: 'Update notification',
    },
  },
  resolve: async (data, { notification }, { viewer, loaders }) => {
    const newNotification = await Notification.update(
      viewer,
      notification,
      loaders,
    );
    return newNotification;
  },
};

export default updateNotification;
