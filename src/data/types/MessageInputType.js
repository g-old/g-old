import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLList,
} from 'graphql';

import RecipientType from './RecipientType';

const MessageInputType = new GraphQLInputObjectType({
  name: 'MessageInput',
  fields: {
    message: {
      type: String,
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
