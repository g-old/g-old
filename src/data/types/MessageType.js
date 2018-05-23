import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import RecipientType from './RecipientType';
import UserType from './UserType';
import User from '../models/User';

const MessageType = new ObjectType({
  name: 'Message',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    message: {
      type: GraphQLString,
    },
    messageHtml: {
      type: GraphQLString,
    },

    subject: {
      type: GraphQLString,
    },
    recipients: {
      type: new GraphQLList(UserType),
      resovle: (parent, args, { viewer, loaders }) =>
        parent.recipients.map(id => User.gen(viewer, id, loaders)),
    },

    sender: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.senderId, loaders);
      },
    },

    recipientType: {
      type: RecipientType,
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default MessageType;
