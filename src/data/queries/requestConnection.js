import { GraphQLInt, GraphQLString, GraphQLID } from 'graphql';

import PageType from '../types/PageType';
import RequestType from '../types/RequestType';
import Request from '../models/Request';
import knex from '../knex';

const request = {
  type: PageType(RequestType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    contentId: {
      type: GraphQLID,
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', type, contentId },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : []; //eslint-disable-line
    id = Number(id);
    let requestIds;
    if (type) {
      const types = ['joinGroup', 'joinWT', 'nameChange', 'avatarChange'];
      const pos = types.indexOf(type);
      if (pos === -1) {
        throw new Error(`Invalid type: ${type}`);
      }
      requestIds = await knex('requests')
        .modify(queryBuilder => {
          if (type === 'joinWT' && contentId) {
            queryBuilder.whereRaw("content->>'id' = ?", [contentId]);
          }
        })
        .where({ type: types[pos] })
        .whereRaw('(requests.created_at, requests.id) < (?,?)', [cursor, id])
        .limit(first)
        .orderBy('requests.created_at', 'desc')
        .orderBy('requests.id', 'desc')
        .select('requests.id as id', 'requests.created_at as time');
    } else {
      requestIds = await knex('requests')
        .whereRaw('(requests.created_at, requests.id) < (?,?)', [cursor, id])
        .limit(first)
        .orderBy('requests.created_at', 'desc')
        .orderBy('requests.id', 'desc')
        .select('requests.id as id', 'requests.created_at as time');
    }

    const queries = requestIds.map(p => Request.gen(viewer, p.id, loaders));

    const requestsSet = requestIds.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              requestsSet[edges[edges.length - 1].node.id].time,
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

export default request;
