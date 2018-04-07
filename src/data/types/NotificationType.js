import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import UserType from './UserType';

// @flow
export type tNotificationType = {
  __typename: 'Notification',
  id: number,
  msg: string,
  title: string,
  date: string,
  sender: typeof UserType,
  location: string,
  type: string,
  createdAt: string,
};

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
