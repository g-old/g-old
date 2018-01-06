import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';

const deleteVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders }) => {
    const { deletedVote } = await Vote.delete(viewer, vote, loaders);

    return deletedVote;
  },
};

export default deleteVote;
