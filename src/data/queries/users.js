import { GraphQLList, GraphQLString } from 'graphql';

import UserType from '../types/UserType';
import User from '../models/User';
import knex from '../knex';

const users = {
  type: new GraphQLList(UserType),
  args: {
    role: {
      type: GraphQLString,
    },
  },

  resolve: (parent, { role }, { viewer, loaders }) =>
    Promise.resolve(
      knex('users')
        .where({ role_id: ['admin', 'mod', 'user', 'viewer', 'guest'].indexOf(role) + 1 })
        .pluck('id')
        .then(ids => ids.map(id => User.gen(viewer, id, loaders))),
    ),
};

export default users;
