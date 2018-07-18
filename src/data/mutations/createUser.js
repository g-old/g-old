import { GraphQLNonNull } from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';

const createUser = {
  type: new GraphQLNonNull(UserType),
  args: {
    user: {
      type: UserInputType,
    },
  },
  resolve: (data, { user }, { viewer, loaders }) => {
    const res = User.create(viewer, user, loaders);
    return res;
  },
};

export default createUser;
