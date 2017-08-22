import { GraphQLNonNull, GraphQLBoolean } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';
import log from '../../logger';
import Proposal from '../models/Proposal';

const createProposalSub = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    subscription: {
      type: PushSubInputType,
      description: 'Subscription details from push service',
    },
  },
  resolve: async (data, { subscription }, { viewer, loaders }) => {
    try {
      if (!viewer.id) return false;
      // check if user is subscribed
      let subIds = await knex('webpush_subscriptions')
        .where({ user_id: viewer.id })
        .count('id');
      subIds = subIds[0].count;
      if (!subIds) return false;

      // Proposal.subscribe(user)
      const proposal = await Proposal.gen(
        viewer,
        subscription.proposalId,
        loaders,
      );
      if (!proposal) return null;
      const subId = await proposal.subscribe(viewer);
      return !!subId;
    } catch (err) {
      if (err.code === '23505') {
        log.warn(
          { subInfo: { err, sub: subscription, viewer } },
          'Subscription already stored',
        );

        return true;
      }
      log.error(
        { subInfo: { err, sub: subscription, viewer } },
        'Creating subscription failed',
      );

      return false;
    }
  },
};

export default createProposalSub;
