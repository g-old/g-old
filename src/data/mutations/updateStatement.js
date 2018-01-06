import { GraphQLNonNull } from 'graphql';
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';

const updateStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: async (data, { statement }, { viewer, loaders }) =>
    Statement.update(viewer, statement, loaders),
};

export default updateStatement;
