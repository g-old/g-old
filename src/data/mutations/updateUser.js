import { GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';

const updateUser = {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'UpdateUserResult',
      fields: {
        errors: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        user: { type: UserType },
      },
    }),
  ), // UserType, // new GraphQLNonNull(UserType),
  args: {
    user: {
      type: UserInputType,
    },
  },
  resolve: async (data, { user }, { viewer, loaders }) => User.update(viewer, user, loaders, true),
};

export default updateUser;
