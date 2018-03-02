import { GraphQLInt, GraphQLString, GraphQLList } from 'graphql';

import PageType from '../types/PageType';
import RequestType from '../types/RequestType';
import Request from '../models/Request';
import FilterInput from '../types/FilterInputType';
import knex from '../knex';

const Types = ['joinGroup', 'joinWT', 'nameChange', 'avatarChange'];
const getFilter = (queryBuilder, filterParam) => {
  switch (filterParam.filter) {
    case 1: {
      return queryBuilder.where({ requester_id: filterParam.id });
      // return 'requester_id = ?';
    }
    case 2: {
      return queryBuilder.whereRaw("content->>'id' = ?", [filterParam.id]);
    }
    default:
      throw new Error(`GetFilter: FilterParam not recognized: ${filterParam}`);
  }
};

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
    filterBy: {
      type: new GraphQLList(FilterInput),
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', type, filterBy },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : []; //eslint-disable-line
    id = Number(id);
    let pos;
    if (type) {
      pos = Types.indexOf(type);
      if (pos === -1) {
        throw new Error(`Invalid type: ${type}`);
      }
    }

    const requestIds = await knex('requests')
      .modify(queryBuilder => {
        if (pos) {
          queryBuilder.where({ type: Types[pos] });
        }
        if (filterBy) {
          filterBy.forEach(filter => getFilter(queryBuilder, filter));
        }
      })
      .whereRaw('(requests.created_at, requests.id) < (?,?)', [cursor, id])
      .limit(first)
      .orderBy('requests.created_at', 'desc')
      .orderBy('requests.id', 'desc')
      .select('requests.id as id', 'requests.created_at as time');

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
