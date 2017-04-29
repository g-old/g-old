import { GraphQLList, GraphQLString } from 'graphql';

import UserType from '../types/UserType';
import User from '../models/User';

const search = {
  type: new GraphQLList(UserType),
  args: {
    term: {
      type: GraphQLString,
    },
  },

  resolve: (parent, { term }, { viewer, loaders }) => User.find(viewer, term, loaders),
};

export default search;
