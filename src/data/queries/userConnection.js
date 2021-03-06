import { GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';

import PageType from '../types/PageType';
import UserType from '../types/UserType';
import User from '../models/User';
import knex from '../knex';

const userConnection = {
  type: PageType(UserType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    group: {
      type: GraphQLInt,
    },
    union: {
      type: GraphQLBoolean,
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', group, union = false },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    // cursor = cursor ? new Date(cursor) : new Date();
    let [cursor = null, id = 0] = pagination ? pagination.split('$') : [];
    id = Number(id);

    cursor = cursor ? new Date(cursor) : new Date();
    // const countQuery = knex.raw('COUNT(users.id) OVER()');
    const users = await knex('users')
      .modify(queryBuilder => {
        if (union) {
          queryBuilder.whereRaw('groups & ? > 0', [group]);
        } else {
          queryBuilder.where({ groups: group });
        }
      })
      .whereNull('users.deleted_at')
      .whereRaw('(users.created_at, users.id) < (?,?)', [cursor, id])
      .limit(first)
      .orderBy('users.created_at', 'desc')
      .orderBy('users.id', 'desc')
      .select('users.id as id', 'users.created_at as time');
    // integrate in first query
    const [count = null] = await knex('users')
      .modify(queryBuilder => {
        if (union) {
          queryBuilder.whereRaw('groups & ? > 0', [group]);
        } else {
          queryBuilder.where({ groups: group });
        }
      })
      .whereNull('users.deleted_at')
      .count('id');
    let totalCount;
    if (count) {
      totalCount = count.count;
    }
    const queries = users.map(u => User.gen(viewer, u.id, loaders));
    const usersSet = users.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              usersSet[edges[edges.length - 1].node.id].time,
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
      totalCount,
    };
  },
};

export default userConnection;
