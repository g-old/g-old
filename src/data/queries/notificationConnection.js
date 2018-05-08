import {
  GraphQLInt,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLEnumType,
} from 'graphql';

import PageType from '../types/PageType';
import { ActivityType } from '../models/Activity';
import NotificationType from '../types/NotificationType';
import Notification from '../models/Notification';
import knex from '../knex';

const FilterParams = new GraphQLEnumType({
  name: 'NotificationFilterParams',
  values: {
    READ: {
      value: 1,
    },
    UNREAD: {
      value: 2,
    },
    PROPOSAL: {
      value: ActivityType.PROPOSAL,
    },
    SURVEY: {
      value: ActivityType.SURVEY,
    },
    DISCUSSION: {
      value: ActivityType.DISCUSSION,
    },
    MESSAGE: {
      value: ActivityType.MESSAGE,
    },
    COMMENT: {
      value: ActivityType.COMMENT,
    },
    STATEMENT: {
      value: ActivityType.STATEMENT,
    },
  },
});

/* const NotificationFilterInput = new GraphQLInputObjectType({
  name: 'NotificationFilter',

  fields: {
    filterBy: {
      type:filterPArams
    },
    id: {
      type: GraphQLID,
    },
  },
}); */

const parseFilter = filterArgs =>
  filterArgs.reduce(
    (acc, filter) => {
      if (filter === 1) {
        acc.notificationStatus.read = true;
      } else if (filter === 2) {
        acc.notificationStatus.unread = true;
      } else {
        acc.types.push(filter);
      }
      return acc;
    },
    { types: [], notificationStatus: {} },
  );
// array of activityTypes
// read/unread
const notification = {
  type: PageType(NotificationType),
  args: {
    first: {
      type: GraphQLInt,
    },
    filterBy: {
      type: new GraphQLList(FilterParams),
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
    { first = 10, after = '', userId, filterBy = [] },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : []; //eslint-disable-line
    id = Number(id);

    const notificationIds = await knex('notifications')
      .where({ user_id: userId || viewer.id })
      .modify(queryBuilder => {
        if (filterBy.length) {
          const filterParams = parseFilter(filterBy);
          let byRead = false;
          if (
            filterParams.notificationStatus.read &&
            !filterParams.notificationStatus.unread
          ) {
            byRead = true;
          }
          if (
            filterParams.notificationStatus.unread &&
            !filterParams.notificationStatus.read
          ) {
            byRead = true;
          }
          if (byRead) {
            queryBuilder.where({
              read: !!filterParams.notificationStatus.read,
            });
          }
          if (filterParams.types.length) {
            queryBuilder
              .join('activities', 'activities.id', 'notifications.activity_id')
              .whereIn('activities.type', filterParams.types);
          }
        }
      })
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
