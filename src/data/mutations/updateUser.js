import { GraphQLNonNull } from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';

const updateUser = {
  type: new GraphQLNonNull(UserType),
  args: {
    user: {
      type: UserInputType,
    },
  },
  resolve: (data, { user }, { viewer, loaders }) => {
    console.log('USER:UPDATE:ARGS', user);
    const res = User.update(viewer, user, loaders);
    return res;
  },
};

export default updateUser;
