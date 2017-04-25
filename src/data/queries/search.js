import { GraphQLList, GraphQLString } from 'graphql';

import UserType from '../types/UserType';
import User from '../models/User';
import knex from '../knex';

const search = {
  type: new GraphQLList(UserType),
  args: {
    term: {
      type: GraphQLString,
    },
  },

  resolve: (parent, { term }, { viewer, loaders }) =>
    Promise.resolve(
      knex('users')
        .where('email', 'ilike', `%${term}%`)
        .pluck('id')
        .then(ids => ids.map(id => User.gen(viewer, id, loaders))),
    ),
};

export default search;
