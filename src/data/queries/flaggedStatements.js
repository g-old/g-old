import { GraphQLList, GraphQLString } from 'graphql';

import FlaggedStatementType from '../types/FlaggedStatementType';
import knex from '../knex';

const flaggedStatements = {
  type: new GraphQLList(FlaggedStatementType),
  args: {
    state: {
      type: GraphQLString,
    },
  },

  resolve: (parent, { state }) =>
    Promise.resolve(
      knex('flagged_statements').where({ state }).orderBy('created_at', 'desc').select(),
    ),
};

export default flaggedStatements;
