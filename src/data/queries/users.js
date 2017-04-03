import { GraphQLList, GraphQLInt } from 'graphql';

import UserType from '../types/UserType';
import User from '../models/User';
import knex from '../knex';

const users = {
  type: new GraphQLList(UserType),
  args: {
    role_id: {
      type: GraphQLInt,
    },
  },

  resolve: (parent, { role_id }, { viewer, loaders }) =>
    Promise.resolve(
      knex('users')
        .where({ role_id })
        .pluck('id')
        .then(ids => ids.map(id => User.gen(viewer, id, loaders))),
    ),
};

export default users;
