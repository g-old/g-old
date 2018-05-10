import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import SubscriptionType from '../types/SubscriptionType';
// import Subscription from '../models/Subscription';
// import knex from '../knex';

const subscription = {
  type: PageType(SubscriptionType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
  },
  /*
  resolve: async (parent, { first = 10, after = '' }, { viewer, loaders }) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
   let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : [];
    id = Number(id);





    const subscriptions = [];
    const queries = subscriptions.map(p =>
      Subscription.gen(viewer, p.id, loaders),
    );
    const subscriptionsSet = subscriptions.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              subscriptionsSet[edges[edges.length - 1].node.id].time,
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
  }, */
};

export default subscription;
