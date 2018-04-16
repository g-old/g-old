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
      type: new GraphQLNonNull(ID),
    },
    read: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});
export default NotificationInputType;
