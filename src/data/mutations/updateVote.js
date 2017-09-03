import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';
import { insertIntoFeed } from '../../core/feed';

const updateVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders, pubsub }) => {
    const { updatedVote, deletedStatement } = await Vote.update(
      viewer,
      vote,
      loaders,
    );

    if (updatedVote) {
      await insertIntoFeed({
        viewer,
        data: { type: 'vote', content: updatedVote, objectId: updatedVote.id },
        verb: 'update',
      });
    }
    if (deletedStatement) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: {
            type: 'statement',
            objectId: deletedStatement.id,
            content: deletedStatement,
          },
          verb: 'delete',
        },
        true,
      );
      pubsub.publish('activities', { id: activityId });
    }
    return updatedVote;
  },
};

export default updateVote;
