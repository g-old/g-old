import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import RoleType from './RoleType';
import Role from '../models/Role';
import User from '../models/User';

const UserType = new ObjectType({
  name: 'User',
  fields: () => ({
    // we need a lazy evaluated fn , bc we use UserType, which has to be defined
    id: { type: ID },
    name: {
      type: GraphQLString,
    },
    surname: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    emailVerified: {
      type: GraphQLBoolean,
    },
    lastLogin: {
      type: GraphQLString,
    },
    privilege: {
      type: GraphQLInt,
    },
    role: {
      type: RoleType,
      resolve(data, args, { viewer, loaders }) {
        return Role.gen(viewer, data.role_id, loaders);
      },
    },
    followees: {
      type: new GraphQLList(UserType),
      resolve: (data, args, { viewer, loaders }) =>
        Promise.resolve(
          User.followees(data.id, loaders).then(ids =>
            ids.map(id => User.gen(viewer, id, loaders)),
          ),
        ),
    },
  }),
});

export default UserType;
