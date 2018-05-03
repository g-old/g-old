import {
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

const NotificationInputType = new GraphQLInputObjectType({
  name: 'NotificationInput',
  fields: {
    id: {
      type: ID,
    },
    read: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    activityId: {
      type: ID,
    },
  },
});
export default NotificationInputType;
