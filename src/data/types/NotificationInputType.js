import { GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

const NotificationInputType = new GraphQLInputObjectType({
  name: 'NotificationInput',
  fields: {
    id: {
      type: ID,
    },
  },
});
export default NotificationInputType;
