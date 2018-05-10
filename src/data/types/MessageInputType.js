import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

const MessageInputType = new GraphQLInputObjectType({
  name: 'MessageInput',
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
            description: 'Message by email',
          },
          message: {
            value: 'message',
            description: 'Message by message in feed',
          },
        },
      }),
    },
  },
});
export default MessageInputType;
