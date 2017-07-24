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
  resolve: async (data, { statement }, { viewer, loaders, pubsub }) => {
    const newStatement = await Statement.create(viewer, statement, loaders);
    if (newStatement) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'statement', objectId: newStatement.id, content: newStatement },
          verb: 'create',
        },
        true,
      );
      pubsub.publish('activities', { id: activityId });
    }
    return newStatement;
  },
};

export default createStatement;
