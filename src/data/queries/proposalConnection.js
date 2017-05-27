import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import knex from '../knex';

const proposal = {
  type: PageType(ProposalType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    state: {
      type: GraphQLString,
    },
  },
  resolve: async (parent, { first = 10, after = '', state }, { viewer, loaders }) => {
    let cursor = parseInt(Buffer.from(after, 'base64').toString('ascii'), 10);
    // cursor = cursor ? new Date(cursor) : new Date();
    cursor = cursor || 0;
    const ids = await knex('proposals')
      .where('proposals.id', '>', cursor)
      .where('polls.closed_at', '=', null)
      .modify((queryBuilder) => {
        if (state === 'active') {
          queryBuilder
            .where({ state: 'proposed' })
            .orWhere({ state: 'voting' })
            .innerJoin('polls', function () {
              this.on('proposals.poll_one_id', '=', 'polls.id').orOn(
                'proposals.poll_two_id',
                '=',
                'polls.id',
              );
            })
            .orderBy('polls.end_time', 'asc');
        } else if (state === 'repelled') {
          queryBuilder.where({ state: 'revoked' }).orWhere({ state: 'rejected' });
        } else if (state) {
          queryBuilder.where({ state });
        }
      })
      .limit(first)
      .pluck('proposals.id');
    /*  const ids = await knex('polls')
      .where({ closed_at: null })
      .innerJoin('proposals', function () {
        this.on('proposals.poll_one_id', '=', 'polls.id').orOn(
          'proposals.poll_two_id',
          '=',
          'polls.id',
        );
      })
      .orderBy('polls.end_time', 'asc')
      .limit(first)
      .pluck('proposals.id');
*/
    const queries = ids.map(id => Proposal.gen(viewer, id, loaders));
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const startCursor = edges.length > 0
      ? Buffer.from(edges[0].node.id.toString()).toString('base64')
      : null;
    const endCursor = edges.length > 0
      ? Buffer.from(edges[edges.length - 1].node.id.toString()).toString('base64')
      : null;

    const hasNextPage = edges.length === first;
    return {
      edges,
      pageInfo: {
        startCursor,
        endCursor,
        hasNextPage,
      },
    };
  },
};

export default proposal;
