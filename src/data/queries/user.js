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
  resolve: (parent, { id }, { viewer, loaders }) =>
    User.gen(viewer, id, loaders),
};

export default user;
