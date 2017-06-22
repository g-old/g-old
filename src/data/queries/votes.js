import { GraphQLNonNull, GraphQLID, GraphQLList } from 'graphql';
import knex from '../knex';

import VoteType from '../types/VoteDLType';
import Vote from '../models/Vote';

const votes = {
  type: new GraphQLNonNull(new GraphQLList(VoteType)),
  args: {
    pollId: {
      description: 'ID of the poll',
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  // TODO make a list loading method in votes or poll model to abstract
  resolve: (parent, { pollId }, { viewer, loaders }) =>
    //  throw Error('TESTERROR');
    knex('votes')
      .where({ poll_id: pollId })
      .pluck('votes.id')
      .then(ids => ids.map(id => Vote.gen(viewer, id, loaders))),
};

export default votes;
