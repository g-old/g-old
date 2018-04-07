import { GraphQLNonNull } from 'graphql';
import NotificationInput from '../types/NotificationInputType';
import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';

const createNotification = {
  type: new GraphQLNonNull(NotificationType),
  args: {
    notification: {
      type: NotificationInput,
      description: 'Create a new notification',
    },
  },
  resolve: async (data, { notification }, { viewer, loaders }) => {
    const newNotification = await Notification.create(
      viewer,
      notification,
      loaders,
    );
    return newNotification;
  },
};

export default createNotification;
