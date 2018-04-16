import { GraphQLNonNull, GraphQLList, GraphQLID } from 'graphql';
import Notification from '../models/Notification';

const clearNotifications = {
  type: new GraphQLNonNull(new GraphQLList(GraphQLID)),

  resolve: async (data, args, { viewer }) => {
    const ids = await Notification.batchUpdate(viewer, {});
    return ids;
  },
};

export default clearNotifications;
