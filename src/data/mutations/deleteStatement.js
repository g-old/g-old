import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import StatementInputType from '../types/StatementInputType';
import Statement from '../models/Statement';

const deleteStatement = {
  type: new GraphQLNonNull(GraphQLID),
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
      Statement.delete(viewer, statement, loaders),

};

export default deleteStatement;
