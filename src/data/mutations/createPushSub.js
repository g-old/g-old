import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';
import log from '../../logger';

const createPushSub = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    subscription: {
      type: PushSubInputType,
      description: 'Subscription details from push service',
    },
  },
  resolve: async (data, { subscription }, { viewer }) => {
    try {
      log.info({ subInfo: { sub: subscription, viewer } }, 'Creating subscription');
      if (!viewer.id) return false;
      await knex('webpush_subscriptions').insert({
        ...subscription,
        user_id: viewer.id,
        created_at: new Date(),
      });
      log.info({ subInfo: { sub: subscription, viewer } }, 'Creating subscription success');

      return true;
    } catch (e) {
      if (e.code === '23505') {
        log.info({ subInfo: { err: e, sub: subscription, viewer } }, 'Subscription already stored');

        return true;
      }
      log.error({ subInfo: { err: e, sub: subscription, viewer } }, 'Creating subscription failed');

      return false;
    }
  },
};

export default createPushSub;
