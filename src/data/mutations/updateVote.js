import {
  GraphQLNonNull,
} from 'graphql';
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
  resolve: (data, { vote }, { viewer, loaders }) => {
    const res = Vote.update(viewer, vote, loaders);
    return res;
  },

};

export default updateVote;
