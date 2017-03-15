import {
  GraphQLNonNull,
} from 'graphql';
import StatementInputType from '../types/StatementInputType';
import Statement from '../models/Statement';
import StatementType from '../types/StatementDLType';

const deleteStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
       Statement.delete(viewer, statement, loaders),
};

export default deleteStatement;
