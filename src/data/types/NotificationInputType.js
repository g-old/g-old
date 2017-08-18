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

    receiver: {
      type: new GraphQLInputObjectType({
        name: 'ReceiverInput',
        fields: {
          type: {
            type: new GraphQLEnumType({
              name: 'ReceiverType',
              values: {
                team: {
                  value: 'team',
                  description: 'Notify team',
                },

                user: {
                  value: 'user',
                  description: 'Notify user',
                },
              },
            }),
          },
          id: {
            type: GraphQLID,
          },
        },
      }),
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
          notification: {
            value: 'notification',
            description: 'Notification by message in feed',
          },
        },
      }),
    },
  },
});
export default NotificationInputType;
