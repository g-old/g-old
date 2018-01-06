import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';

const updateVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders }) => {
    const { updatedVote } = await Vote.update(viewer, vote, loaders);

    return updatedVote;
  },
};

export default updateVote;
