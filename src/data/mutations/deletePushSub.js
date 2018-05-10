import { GraphQLNonNull, GraphQLString } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';
import log from '../../logger';

const deletePushSub = {
  type: new GraphQLNonNull(GraphQLString),
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

      if (!viewer.id) return JSON.stringify({ error: true });
      await knex('webpush_subscriptions')
        .where({ endpoint: subscription.endpoint, user_id: viewer.id })
        .del();

      // check if user has remaining subscriptions
      const [subscriptionData] = await knex('webpush_subscriptions')
        .where({ user_id: viewer.id })
        .count('id');
      if (subscriptionData.count > 0) {
        return JSON.stringify({ error: false });
      }

      const [settingsData] = await knex('notification_settings')
        .where({ user_id: viewer.id })
        .select('settings');
      const { settings } = settingsData;
      let newSettings = {};
      if (settings) {
        newSettings = Object.keys(settings).reduce((acc, field) => {
          if (field in settings) {
            if (settings[field].email) {
              acc[field] = { email: true };
            }
          }
          return acc;
        }, {});
        await knex('notification_settings')
          .where({ user_id: viewer.id })
          .update({ settings: newSettings, updated_at: new Date() });
      }
      log.info(
        { subInfo: { sub: subscription, viewer } },
        'Deleting subscription success',
      );
      return JSON.stringify({ settings: newSettings });
    } catch (e) {
      log.error(
        { subInfo: { sub: subscription, viewer } },
        'Deleting subscription failed',
      );

      return JSON.stringify({ error: true });
    }
  },
};

export default deletePushSub;
