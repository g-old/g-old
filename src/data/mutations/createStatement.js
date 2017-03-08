
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';

const createStatement = {
  type: StatementType,
  args: {
    statement: {
      type: StatementInputType,
      description: 'Create a new Statement',
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
      Statement.create(viewer, statement, loaders),

};

export default createStatement;