import { GraphQLNonNull } from 'graphql';
import NotificationInput from '../types/NotificationInputType';
import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';

const deleteNotification = {
  type: new GraphQLNonNull(NotificationType),
  args: {
    notification: {
      type: NotificationInput,
      description: 'Delete notification',
    },
  },
  resolve: async (data, { notification }, { viewer, loaders }) => {
    const newNotification = await Notification.delete(
      viewer,
      notification,
      loaders,
    );
    return newNotification;
  },
};

export default deleteNotification;
