import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

import Activity from '../models/Activity';
import ActivityType from './ActivityType';

const NotificationType = new ObjectType({
  name: 'Notification',
  fields: () => ({
    id: {
      type: ID,
    },
    activity: {
      type: ActivityType,
      resolve: (parent, args, { viewer, loaders }) =>
        Activity.gen(viewer, parent.activityId, loaders),
    },
    read: {
      type: GraphQLBoolean,
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  }),
});

export default NotificationType;
