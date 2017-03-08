
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';

const updateStatement = {
  type: StatementType,
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: (data, { statement }, { viewer, loaders }) =>
      Statement.update(viewer, statement, loaders),

};

export default updateStatement;
