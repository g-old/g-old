import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';

const deleteVote = {
  type: new GraphQLNonNull(GraphQLID),
  args: {
    vote: {
      type: VoteInputType,
    },
  },
  resolve: (data, { vote }, { viewer, loaders }) => {
    const res = Vote.delete(viewer, vote, loaders);
    return res;
  },

};

export default deleteVote;
