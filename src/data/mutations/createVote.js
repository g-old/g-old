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
  resolve: (data, { vote }, { viewer, loaders }) =>
    Vote.create(viewer, vote, loaders).then((res) => {
      Vote.insertInFeed(viewer, res, 'create');
      return res;
    }),
};

export default createVote;
