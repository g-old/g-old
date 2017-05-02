import { GraphQLNonNull } from 'graphql';
import FlaggedStatementInputType from '../types/FlaggedStatementInputType';
import FlaggedStatementType from '../types/FlaggedStatementType';
import Statement from '../models/Statement';

const createFlaggedStatement = {
  type: new GraphQLNonNull(FlaggedStatementType),
  args: {
    statement: {
      type: FlaggedStatementInputType,
      description: 'Flag a statement',
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) => Statement.flag(viewer, statement, loaders),
};

export default createFlaggedStatement;
