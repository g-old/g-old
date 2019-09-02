import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

import Activity from '../models/Activity';
import ActivityType from './ActivityType';
import GraphQLDate from './GraphQLDateType';

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
      type: GraphQLDate,
    },
    updatedAt: {
      type: GraphQLDate,
    },
  }),
});

export default NotificationType;
