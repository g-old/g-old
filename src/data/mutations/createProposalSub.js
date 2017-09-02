import { GraphQLNonNull } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import knex from '../knex';
import log from '../../logger';
import Proposal from '../models/Proposal';
import ProposalType from '../types/ProposalDLType';

const createProposalSub = {
  type: new GraphQLNonNull(ProposalType),
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
      if (subIds < 1) return null;

      // Proposal.subscribe(user)
      const proposal = await Proposal.gen(
        viewer,
        subscription.proposalId,
        loaders,
      );
      if (!proposal) return null;
      await proposal.subscribe(viewer);
      return Proposal.gen(viewer, subscription.proposalId, loaders);
    } catch (err) {
      if (err.code === '23505') {
        log.warn(
          { subInfo: { err, sub: subscription, viewer } },
          'Subscription already stored',
        );
      } else {
        log.error(
          { subInfo: { err, sub: subscription, viewer } },
          'Creating subscription failed',
        );
      }

      return Proposal.gen(viewer, subscription.proposalId, loaders);
    }
  },
};

export default createProposalSub;
