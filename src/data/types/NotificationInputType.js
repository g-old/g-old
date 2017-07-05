import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

const NotificationInputType = new GraphQLInputObjectType({
  name: 'NotificationInput',
  fields: {
    message: {
      type: new GraphQLNonNull(String),
    },
    subject: {
      type: String,
    },

    receiverId: { type: new GraphQLNonNull(GraphQLID) },

    type: {
      type: new GraphQLEnumType({
        name: 'Transport',
        values: {
          email: {
            value: 'email',
            description: 'Notification by email',
          },
        },
      }),
    },
  },
});
export default NotificationInputType;
