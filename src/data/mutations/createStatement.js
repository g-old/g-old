
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementType';
import Statement from '../models/Statement';

const createStatement = {
  type: StatementType,
  args: {
    statement: {
      type: StatementInputType,
      description: 'Create a new Statement',
    },
  },
  resolve: (data, { statement }) => {
    const res = Statement.create({ id: 1 }, statement);
    return res;
  },

};

export default createStatement;
