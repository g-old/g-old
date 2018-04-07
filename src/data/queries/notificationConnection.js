import { GraphQLInt, GraphQLString, GraphQLID } from 'graphql';

import PageType from '../types/PageType';
import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';
import knex from '../knex';

const notification = {
  type: PageType(NotificationType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    userId: {
      type: GraphQLID,
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', userId },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : []; //eslint-disable-line
    id = Number(id);

    const notificationIds = await knex('notifications')
      .where({ user_id: userId, read: false })
      .whereRaw('(notifications.created_at, notifications.id) < (?,?)', [
        cursor,
        id,
      ])
      .limit(first)
      .orderBy('notifications.created_at', 'desc')
      .orderBy('notifications.id', 'desc')
      .select('notifications.id as id', 'notifications.created_at as time');

    const queries = notificationIds.map(p =>
      Notification.gen(viewer, p.id, loaders),
    );

    const notificationsSet = notificationIds.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              notificationsSet[edges[edges.length - 1].node.id].time,
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

export default notification;
