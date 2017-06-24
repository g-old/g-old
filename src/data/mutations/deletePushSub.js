import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';

const deletePushSub = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    subscription: {
      type: PushSubInputType,
      description: 'Subscription details from push service',
    },
  },
  resolve: async (data, { subscription }, { viewer }) => {
    try {
      if (!viewer.id) return false;
      await knex('webpush_subscriptions')
        .where({ endpoint: subscription.endpoint, user_id: viewer.id })
        .del();
      return true;
    } catch (e) {
      return false;
    }
  },
};

export default deletePushSub;
