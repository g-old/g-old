import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import FlaggedStatementType from '../types/FlaggedStatementType';
import knex from '../knex';

const flags = {
  name: 'FlagConnection',
  type: PageType(FlaggedStatementType),
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
  resolve: async (parent, { first = 10, state, after = '' }) => {
    let cursor = parseInt(Buffer.from(after, 'base64').toString('ascii'), 10);
    // cursor = cursor ? new Date(cursor) : new Date();
    cursor = cursor || 0;
    const data = await knex('flagged_statements')
      .where({ state })
      //  .where('created_at', '<', cursor)
      .where('id', '>', cursor)
      .orderBy('created_at', 'asc')
      .limit(first)
      .select();

    const edges = data.map(f => ({ node: f }));
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

export default flags;
