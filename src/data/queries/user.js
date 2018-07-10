import { GraphQLNonNull, GraphQLID } from 'graphql';

import UserType from '../types/UserType';
import User from '../models/User';

const user = {
  type: UserType,
  args: {
    id: {
      description: 'The users ID number',
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  resolve: async (parent, { id }, { viewer, loaders }) => {
    const result = await User.gen(viewer, id, loaders);
    if (result.deletedAt) {
      return { id: result.id, deletedAt: result.deletedAt };
    }
    return result;
  },
};

export default user;
