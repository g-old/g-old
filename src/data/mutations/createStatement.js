import { GraphQLNonNull } from 'graphql';
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';
import { insertIntoFeed } from '../../core/feed';

const createStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
      description: 'Create a new Statement',
    },
  },
  resolve: async (data, { statement }, { viewer, loaders }) => {
    const newStatement = await Statement.create(viewer, statement, loaders);
    if (newStatement) {
      await insertIntoFeed(
        {
          viewer,
          data: { type: 'statement', objectId: newStatement.id, content: newStatement },
          verb: 'create',
        },
        true,
      );
    }
    return newStatement;
  },
};

export default createStatement;
