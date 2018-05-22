import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
} from 'graphql';

import RecipientType from './RecipientType';

const MessageInputType = new GraphQLInputObjectType({
  name: 'MessageInput',
  fields: {
    message: {
      type: new GraphQLNonNull(String),
    },
    messageHtml: {
      type: String,
    },
    subject: {
      type: String,
    },

    recipients: {
      type: new GraphQLList(GraphQLID),
    },
    recipientType: { type: RecipientType },
  },
});
export default MessageInputType;
