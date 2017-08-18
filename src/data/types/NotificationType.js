import { GraphQLID, GraphQLNonNull, GraphQLString, GraphQLObjectType as ObjectType } from 'graphql';

import UserType from './UserType';

const NotificationType = new ObjectType({
  name: 'Notification',

  fields: {
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
  },
});
export default NotificationType;
