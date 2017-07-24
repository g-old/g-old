import { GraphQLNonNull } from 'graphql';
import StatementInputType from '../types/StatementInputType';
import Statement from '../models/Statement';
import StatementType from '../types/StatementDLType';
import { insertIntoFeed } from '../../core/feed';

const deleteStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: async (data, { statement }, { viewer, loaders, pubsub }) => {
    const deletedStatement = await Statement.delete(viewer, statement, loaders);
    if (deletedStatement) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'statement', objectId: deletedStatement.id, content: deletedStatement },
          verb: 'delete',
        },
        true,
      );
      pubsub.publish('activities', { id: activityId });
    }
    return deletedStatement;
  },
};

export default deleteStatement;
