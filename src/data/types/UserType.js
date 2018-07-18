import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

import { Permissions } from '../../organization';

/* eslint-disable */
const canSee = (viewer, data) =>
  data.id == viewer.id || (viewer.permissions & Permissions.VIEW_USER_INFO) > 0;
/* eslint-enable */

const UserType = new ObjectType({
  name: 'User',
  fields: () => ({
    // we need a lazy evaluated fn , bc we use UserType, which has to be defined
    id: { type: new GraphQLNonNull(ID) },
    name: {
      type: GraphQLString,
    },
    surname: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.email : null;
      },
    },
    locale: {
      type: GraphQLString,
    },
    thumbnail: {
      type: GraphQLString,
    },
    emailVerified: {
      type: GraphQLBoolean,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.emailVerified : null;
      },
    },
    lastLogin: {
      type: GraphQLString,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.lastLogin : null;
      },
    },
    createdAt: {
      type: GraphQLString,
    },
    groups: {
      type: GraphQLInt,
    },
  }),
});

export default UserType;
