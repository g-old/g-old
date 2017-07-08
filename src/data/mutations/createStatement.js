import { GraphQLNonNull } from 'graphql';
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';

const createStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
      description: 'Create a new Statement',
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
    Statement.create(viewer, statement, loaders).then((res) => {
      if (res) {
        Statement.insertInFeed(viewer, res, 'create');
      }
      return res;
    }),
};

export default createStatement;
