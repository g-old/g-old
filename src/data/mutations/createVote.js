import { GraphQLNonNull } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';

const createVote = {
  type: new GraphQLNonNull(VoteType),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: async (data, { vote }, { viewer, loaders }) =>
    Vote.create(viewer, vote, loaders),
};

export default createVote;
