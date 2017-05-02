import { GraphQLNonNull } from 'graphql';
import FlaggedStatementInputType from '../types/FlaggedStatementInputType';
import FlaggedStatementType from '../types/FlaggedStatementType';
import Statement from '../models/Statement';

const updateFlaggedStatement = {
  type: new GraphQLNonNull(FlaggedStatementType),
  args: {
    statement: {
      type: FlaggedStatementInputType,
      description: 'Solve flagged statement',
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
    Statement.solveFlag(viewer, statement, loaders),
};

export default updateFlaggedStatement;
