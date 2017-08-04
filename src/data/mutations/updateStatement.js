import { GraphQLNonNull } from 'graphql';
import StatementInputType from '../types/StatementInputType';
import StatementType from '../types/StatementDLType';
import Statement from '../models/Statement';
import { insertIntoFeed } from '../../core/feed';

const updateStatement = {
  type: new GraphQLNonNull(StatementType),
  args: {
    statement: {
      type: StatementInputType,
    },
  },
  resolve: async (data, { statement }, { viewer, loaders, pubsub }) => {
    const updatedStatement = await Statement.update(viewer, statement, loaders);
    if (updatedStatement) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'statement', objectId: updatedStatement.id, content: updatedStatement },
          verb: 'update',
        },
        false, // dont insert updates into system feed
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
    }
    return updatedStatement;
  },
};

export default updateStatement;
