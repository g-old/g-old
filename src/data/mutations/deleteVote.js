import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';
import { insertIntoFeed } from '../../core/feed';

const deleteVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders, pubsub }) => {
    const { deletedVote, deletedStatement } = await Vote.delete(
      viewer,
      vote,
      loaders,
    );
    if (deletedVote) {
      await insertIntoFeed({
        viewer,
        data: { type: 'vote', content: deletedVote, objectId: deletedVote.id },
        verb: 'delete',
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
    return deletedVote;
  },
};

export default deleteVote;
