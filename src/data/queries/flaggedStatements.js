import { GraphQLList } from 'graphql';

import FlaggedStatementType from '../types/FlaggedStatementType';
import knex from '../knex';

const flaggedStatements = {
  type: new GraphQLList(FlaggedStatementType),

  resolve: () => Promise.resolve(knex('flagged_statements').orderBy('created_at', 'desc').select()),
};

export default flaggedStatements;
