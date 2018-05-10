import { GraphQLID } from 'graphql';

import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';

const notification = {
  type: NotificationType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Notification.gen(viewer, id, loaders),
};

export default notification;
