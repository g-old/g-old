import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import AssetType from '../types/AssetType';
import Asset from '../models/Asset';
import knex from '../knex';

const asset = {
  type: PageType(AssetType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
  },
  resolve: async (parent, { first = 10, after = '' }, { viewer, loaders }) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : [];
    id = Number(id);
    cursor = cursor ? new Date(cursor) : new Date();

    const assets = await knex('assets')
      // .whereRaw('groups & ? > 0', [group]) TODO Later
      .whereRaw('(assets.created_at, assets.id) < (?,?)', [cursor, id])
      .limit(first)
      .orderBy('assets.created_at', 'desc')
      .orderBy('assets.id', 'desc')
      .select('users.id as id', 'assets.created_at as time');

    const queries = assets.map(p => Asset.gen(viewer, p.id, loaders));
    const assetsSet = assets.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              assetsSet[edges[edges.length - 1].node.id].time,
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

export default asset;
