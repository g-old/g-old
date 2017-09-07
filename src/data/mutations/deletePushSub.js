import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';
import log from '../../logger';

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
      log.info(
        { subInfo: { sub: subscription, viewer } },
        'Deleting subscription start',
      );

      if (!viewer.id) return false;
      await knex('webpush_subscriptions')
        .where({ endpoint: subscription.endpoint, user_id: viewer.id })
        .del();
      log.info(
        { subInfo: { sub: subscription, viewer } },
        'Deleting subscription success',
      );
      return true;
    } catch (e) {
      log.error(
        { subInfo: { sub: subscription, viewer } },
        'Deleting subscription failed',
      );

      return false;
    }
  },
};

export default deletePushSub;
