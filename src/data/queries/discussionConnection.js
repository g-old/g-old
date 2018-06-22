import { GraphQLInt, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';

import PageType from '../types/PageType';
import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';
import knex from '../knex';

const discussionConnection = {
  type: PageType(DiscussionType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    workteamId: {
      type: GraphQLID,
    },
    closed: {
      type: GraphQLBoolean,
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', workteamId, closed },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    // cursor = cursor ? new Date(cursor) : new Date();
    let [cursor = null, id = 0] = pagination ? pagination.split('$') : [];
    id = Number(id);

    cursor = cursor ? new Date(cursor) : new Date();

    const discussions = await knex('discussions')
      // .whereRaw('groups & ? > 0', [group]) TODO Later
      .where({ work_team_id: workteamId })
      .modify(queryBuilder => {
        if (!closed) {
          queryBuilder.whereNull('closed_at');
        } else {
          queryBuilder.whereNotNull('closed_at');
        }
      })
      .whereRaw('(discussions.created_at, discussions.id) < (?,?)', [
        cursor,
        id,
      ])
      .limit(first)
      .orderBy('discussions.created_at', 'desc')
      .orderBy('discussions.id', 'desc')
      .select('discussions.id as id', 'discussions.created_at as time');
    const queries = discussions.map(u => Discussion.gen(viewer, u.id, loaders));
    const discussionsSet = discussions.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              discussionsSet[edges[edges.length - 1].node.id].time,
            ).toJSON()}$${edges[edges.length - 1].node.id}`,
          ).toString('base64')
        : null;

    const hasNextPage = edges.length === first;
    return {
      edges,
      pageInfo: {
        startCursor: null,
        endCursor,
        hasNextPage,
      },
    };
  },
};

export default discussionConnection;
