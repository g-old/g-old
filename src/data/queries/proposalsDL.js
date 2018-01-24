import { GraphQLString, GraphQLList } from 'graphql';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import knex from '../knex';

const proposals = {
  type: new GraphQLList(ProposalType),
  args: {
    state: {
      description: 'The proposals state',
      type: GraphQLString,
    },
  },

  resolve: (parent, { state }, { viewer, loaders }) =>
    Promise.resolve(
      knex('proposals')
        .modify(queryBuilder => {
          if (state === 'active') {
            queryBuilder
              .where({ state: 'proposed' })
              .orWhere({ state: 'voting' })
              .innerJoin('polls', function() {
                this.on('proposals.poll_one_id', '=', 'polls.id').orOn(
                  'proposals.poll_two_id',
                  '=',
                  'polls.id',
                );
              })
              .orderBy('polls.end_time', 'asc');
          } else if (state === 'repelled') {
            queryBuilder
              .where({ state: 'revoked' })
              .orWhere({ state: 'rejected' });
          } else if (state) {
            queryBuilder.where({ state });
          }
        })
        .pluck('proposals.id')
        .then(ids => ids.map(id => Proposal.gen(viewer, id, loaders))),
    ),
};

export default proposals;
