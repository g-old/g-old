import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';
import { insertIntoFeed } from '../../core/feed';

const createVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders }) => {
    const newVote = await Vote.create(viewer, vote, loaders);
    if (newVote) {
      await insertIntoFeed({
        viewer,
        data: { type: 'vote', content: newVote, objectId: newVote.id },
        verb: 'create',
      });
    }
    return newVote;
  },
};

export default createVote;
