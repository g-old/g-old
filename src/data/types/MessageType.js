import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import UserType from './UserType';
import User from '../models/User';

const MessageType = new ObjectType({
  name: 'Message',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    msg: {
      type: GraphQLString,
    },

    title: {
      type: GraphQLString,
    },

    date: {
      type: GraphQLString,
    },

    sender: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.senderId, loaders);
      },
    },

    location: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default MessageType;
