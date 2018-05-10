import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import Notification from '../models/Notification';

const clearNotifications = {
  type: new GraphQLNonNull(GraphQLBoolean),

  resolve: async (data, args, { viewer }) =>
    Notification.batchUpdate(viewer, {}),
};

export default clearNotifications;
